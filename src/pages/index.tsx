import type { NextPage } from "next";
import Head from "next/head";
import React, { FocusEventHandler, HTMLProps, KeyboardEventHandler, memo, UIEvent, UIEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { trpc } from "../utils/trpc";
import { Field, Note } from '@prisma/client';
import { NoteType } from '@prisma/client';
import { getParsedType } from "zod";
import { ParsedNote, ParsedNoteType } from "../server/router/notes";
import { DeckWithChildren } from "../server/router/decks";
import { HiCheck, HiChevronDown, HiClock } from "react-icons/hi";
import { ImSpinner } from "react-icons/im";
import clsx from "clsx";
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { useRouter } from "next/router";
import { updatePaginatedItem, removePaginatedItems } from '../utils/pagination';
import create from "zustand";
import shallow from "zustand/shallow";
import { useVirtual } from "@tanstack/react-virtual"
import useEvent from "react-use/lib/useEvent";
import range from "lodash-es/range"
import { UseInfiniteQueryOptions } from "react-query";
import chalk from 'chalk';
import * as Portal from "@radix-ui/react-portal";

const useNotes = (props?: UseInfiniteQueryOptions) => {
  const queryParams = useFilterParams();
  const { data, fetchNextPage, isLoading } = trpc.proxy.notes.paginate.useInfiniteQuery(queryParams, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    refetchOnWindowFocus: false,
    ...(props as any) // Otherwise we lose the type hints?
  })
  const notes = useMemo(() => (data?.pages ?? []).flatMap(page => page.items), [data])

  return { notes, isLoading, fetchNextPage, queryParams }
}

const Home: NextPage = () => {
  const { notes, isLoading, fetchNextPage } = useNotes();
  const { data: noteTypes } = trpc.proxy.notes.types.useQuery();

  const getNoteType = useCallback((ntid: bigint) => {
    return noteTypes?.find(nt => nt.id === ntid)
  }, [noteTypes])

  const logScroll = useEditor(store => store.logScroll)

  const handleScroll = useCallback<UIEventHandler<HTMLDivElement>>(
    (e) => {
      logScroll()
      // @ts-ignore
      const bottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 300;
      if (bottom) {
        fetchNextPage()
      }
    }, [fetchNextPage, logScroll])

  const parentRef = useRef<HTMLDivElement | null>(null)
  const rowVirtualizer = useVirtual({
    parentRef,
    size: notes.length,
    estimateSize: useCallback(() => 100, []),
  })

  const keyboardHandler = useEditor(store => store.keyboardHandler);
  useEvent('keydown', keyboardHandler as unknown as EventListenerOrEventListenerObject, typeof document !== "undefined" ? document : null)

  return (
    <>
      <Head>
        <title>Anki Squared</title>
        <meta name="description" content="An superpowered interface to your Anki notes" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <main className="w-[max-content] min-w-[calc(100vw-13rem)]">
          <header className="navbar bg-base-200 px-4 w-full h-16 min-w-[calc(100vw-13rem)]">
            <Filters />
          </header>
          <div
            ref={parentRef}
            onScroll={handleScroll}
            className="h-[calc(100vh-4rem)] overflow-auto w-[max-content] min-w-[calc(100vw-13rem)]"
          >
            <div
              className="flex flex-col divide-y w-[max-content] relative min-w-[calc(100vw-13rem)] overflow-x-auto items-stretch"
              style={{ height: `${rowVirtualizer.totalSize}px`, position: "relative" }}
            >
              {rowVirtualizer.virtualItems.map((virtualItem) => (
                <NoteRow
                  note={notes[virtualItem.index]!}
                  type={getNoteType(notes[virtualItem.index]!.ntid)}
                  index={virtualItem.index}
                  key={virtualItem.key}
                  style={{
                    display: "flex",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                />
              ))}
            </div>
            {isLoading &&
              <div className="w-full flex items-center justify-center py-4"><ImSpinner className="animate-spin" /></div>}
          </div>
        </main>
      </Layout>
      <ActionBar />
    </>
  );
};

// This is messier than it has to be because of the synching between react-query's useQuery & zustand's store.
// React-query gives us the mutation to perform a deletion & undo it server-side,
// but we need to register the mutation in zustand, and then call the action via the zustand store `fire`. 
const useDelete = () => {
  const utils = trpc.useContext();
  const { notes, queryParams } = useNotes({ refetchOnMount: false });
  const { mutate: deleteNotes } = trpc.proxy.notes.delete.useMutation({
    // @ts-ignore
    onMutate: ({ ids }) => {
      // @ts-ignore
      utils.setInfiniteQueryData(['notes.paginate', queryParams], prev => removePaginatedItems(prev, ids))
    }
  });

  const { mutate: undeleteNotes } = trpc.proxy.notes.undelete.useMutation({
    onMutate: () => {
      utils.queryClient.invalidateQueries(['notes.paginate', queryParams])
    }
  });

  const [on, off, fire, getSelectedNotes] = useEditor(store => [store.on, store.off, store.fire, store.getSelectedNotes], shallow);

  const handleDelete = useCallback(async () => {
    if (typeof window === "undefined" || (window.prompt("Are you sure? (y/n)") !== "y")) {
      throw new Error("Delete cancelled")
    };
    const noteIds = getSelectedNotes(notes).map(n => n.id);
    const asyncDeleteNotes = async (ids: bigint[]) => new Promise<{ noteIds: bigint[], cardIds: bigint[] }>(resolve => deleteNotes({ ids }, { onSuccess: resolve }));

    const action = {
      type: "delete" as const,
      ...(await asyncDeleteNotes(noteIds)),
    }

    return action
  }, [deleteNotes, notes, getSelectedNotes])

  const handleUndo = useCallback(({ type, ...rest }: Action) => {
    undeleteNotes(rest)
  }, [undeleteNotes])

  useEffect(() => {
    on("delete", handleDelete, handleUndo);
    return () => off("delete");
  }, [on, off, handleDelete, handleUndo])

  return useCallback(() => fire("delete"), [fire])
}

const ActionBar = () => {
  const rowSelection = useEditor(store => store.rowSelection);
  const onDelete = useDelete();

  if (typeof rowSelection === "number" || !rowSelection) {
    return null;
  }

  const numSelected = Math.abs(rowSelection.cursor - rowSelection.anchor) + 1;

  return (
    <div className={
      clsx(
        "absolute bottom-8 w-80 left-[calc(50%-10rem)] shadow-lg bg-base-100 brightness-150 border-4 border-base-300 rounded-lg p-2",
        "flex gap-2 items-center"
      )
    } >
      <span>{numSelected} selected</span>
      <button onClick={onDelete} className="btn btn-sm btn-outline">Delete</button>
    </div>
  )
}


const Filters = () => {
  const router = useRouter();
  const status = useFilterParams().status;
  const toggleStatus = useCallback(() => {
    router.query.status = status === 'queue' ? undefined : status === 'ready' ? 'queue' : 'ready'
    router.push(router)
  }, [router, status]);

  return (
    // TODO: Dropdown menu
    <button className="btn btn-sm btn-outline" onClick={toggleStatus}>{status ?? "No Filters"}</button>
  )
}

const Layout: React.FC<HTMLProps<HTMLDivElement>> = ({ children, ...props }) => {
  const { data: decks } = trpc.proxy.decks.hierarchy.useQuery();

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="bg-base-300 w-52">
        <header className="px-4 pt-4 pb-2 border-b">
          <h1 className="text-3xl leading-normal font-extrabold ">
            Anki<sup className="text-sky-500">2</sup>
          </h1>
        </header>
        <nav className="p-4">
          <h2 className="opacity-50 font-bold pb-2">Decks</h2>
          <ul className="flex flex-col gap-2 overflow-x-hidden">
            {decks?.map(deck => (
              <DeckLI deck={deck} key={deck.id.toString()} />
            ))}
          </ul>
        </nav>
      </aside>
      <div className="col-span-5 overflow-hidden" {...props}>
        {children}
      </div>
    </div>
  )
}

const DeckLI: React.FC<{ deck: DeckWithChildren }> = ({ deck }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const select = () => {
    router.query.did = deck.id.toString();
    router.push(router)
  }
  const toggle = () => {
    select()
    setIsOpen(o => !o);
  }
  const [ref] = useAutoAnimate<HTMLLIElement>();


  if ("children" in deck && deck.children && deck.children.length > 0) {
    return (
      <li className="text-sm w-full" ref={ref}>
        <button onClick={toggle} className="cursor-pointer hover:bg-base-200 flex gap-1 items-center px-2 truncate rounded-lg">
          <HiChevronDown className={clsx("text-sm transition duration-300", !isOpen && "rotate-180")} />{deck.name}
        </button>
        {isOpen &&
          <ul className={"pl-8"}>
            {deck.children.map(subdeck => <DeckLI deck={subdeck} key={subdeck.id.toString()} />)}
          </ul>
        }
      </li>
    )
  }

  return (
    <li className="text-sm gap-1 flex ">
      <button onClick={select} className="cursor-pointer hover:bg-base-200 flex gap-1 items-center px-2 truncate rounded-lg">
        {deck.name}
      </button>
    </li>
  )
}

const useFilterParams = () => {
  const router = useRouter();
  const queryParams: { did?: number | number[], status?: "queue" | "ready" } = {};

  if (router.query.status === "queue" || router.query.status === "ready") {
    queryParams.status = router.query.status as "queue" | "ready";
  }

  if (typeof router.query.did === "string") {
    queryParams.did = parseInt(router.query.did);
  } else if (Array.isArray(router.query.did)) {
    queryParams.did = router.query.did.map(parseInt);
  }

  return queryParams
}

const useToggleStatus = (id: bigint, status: "queue" | "ready") => {
  const queryParams = useFilterParams();
  const utils = trpc.useContext()
  const { mutate: _toggleStatus } = trpc.proxy.notes.status.toggle.useMutation({
    onMutate: () => {
      utils.setInfiniteQueryData(
        // @ts-ignore (This is working)
        ['notes.paginate', queryParams],
        (prev) =>
          // @ts-ignore (This is working)
          updatePaginatedItem(prev!, id, (note: ParsedNote) => ({
            ...note,
            tags: status === "queue" ? note.tags.splice(1) : ["1", ...note.tags],
            status: status === "queue" ? "ready" : "queue"
          }))
      )
    }
  })

  const toggleStatus = useCallback(async () => _toggleStatus({ id }), [_toggleStatus, id]);
  return toggleStatus
}

interface NoteRowProps extends HTMLProps<HTMLDivElement> { note: ParsedNote, type?: ParsedNoteType, index: number }

const NoteRow = ({ note, type, index, ...props }: NoteRowProps) => {
  const toggleStatus = useToggleStatus(note.id, note.status)

  const modelFields = useMemo(() => (type?.fields ?? []).sort((a, b) => a.ord - b.ord), [type?.fields])
  const editor = useEditor(store => store);
  const [min, max] = editor.getSelectionRange();


  const statusIcon = useMemo(() => note.status === "queue"
    ? <HiClock tabIndex={0} className="bg-warning text-white btn btn-circle btn-xs" onClick={toggleStatus} />
    : <HiCheck tabIndex={0} className="bg-green-700 text-white btn btn-circle btn-xs" onClick={toggleStatus} />,
    [note.status, toggleStatus]
  );

  if (!type) {
    console.error("No type found for note", note)
    return <></>
  }

  return (
    <div
      onMouseOver={() => editor.setRowHover(index)}
      {...props}
      className={
        clsx(
          "flex flex-row divide-x-2 w-full",
          (!editor.rowSelection && editor.rowHover === index) && "bg-base-200",
          (editor.rowSelection === index) && "bg-base-200 border-y-2 border-base-300",
          (typeof editor.rowSelection !== "number" && min <= index && max >= index) && "bg-blue-100 dark:bg-slate-800 border-y-2 border-blue-200 dark:border-slate-700",
          (typeof editor.rowSelection !== "number" && editor.rowSelection?.cursor === index) && "bg-blue-200 dark:bg-slate-700 border-y-2 border-blue-300 dark:border-slate-600",
          min === index && "outline-b-none",
          max === index && "outline-t-none",
          props.className
        )
      }
      id={`row-${index}`}
    >
      <div className="flex justify-center items-center px-4">
        {statusIcon}
      </div>
      {
        note.fields.map((field, i) => (
          <MemoizedRowField key={i} row={index} col={i} field={field} label={modelFields[i]?.name} />
        ))
      }
    </div >
  )
}


const RowField = ({ label, field, row, col }: { label: string | undefined, field: string, row: number, col: number }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const [isEditing, fieldSelection, setFieldSelection] = useEditor(store => [store.isEditing, store.fieldSelection, store.setFieldSelection], shallow);
  const [_, isScrolling, logScroll] = useEditor(store => [store.lastScrollTime, store.isScrolling(), store.logScroll], shallow);
  const select = useCallback(() => setFieldSelection(col), [col, setFieldSelection]);

  const [_isHovering, setIsHovering] = useState(false);
  const handleMouseOver = useCallback(() => setIsHovering(true), [setIsHovering]);
  const handleMouseOut = useCallback(() => setIsHovering(false), [setIsHovering]);

  const isHovering = (_isHovering
    && (ref.current?.children?.[0]?.clientHeight ?? 0) > 100
    && !isScrolling);


  const contents = useMemo(() => {
    const contents = (
      <div className={clsx("w-full h-[max-content]")}>
        <label className="w-full text-xs opacity-50 pt-2">{label}</label>
        {
          (isEditing && fieldSelection === col) ?
            <textarea defaultValue={field} autoFocus className="h-full" onFocus={moveCaretToEnd} />
            : <div dangerouslySetInnerHTML={{ __html: field }} className="prose" />
        }
      </div>
    )

    if (isHovering) {
      // TODO: Animate this?
      const { top, left, width } = ref.current?.getBoundingClientRect() ?? {};
      return (
        <Portal.Root
          className={
            "fixed bg-base-200 px-2 border-l-2 border-b-2 border-base-300"
          }
          style={{ top, left, width, minHeight: 100 }}
          onWheel={logScroll}
        >
          {contents}
        </Portal.Root>
      )
    }

    return contents;
  }, [isHovering, label, fieldSelection, col, field, isEditing,])

  return (
    <div
      className={
        "flex flex-1 flex-col min-w-[150px] overflow-hidden px-2"
      }
      // onClick={select}
      ref={ref}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      {contents}
    </div>
  )
}

const moveCaretToEnd: FocusEventHandler<HTMLTextAreaElement> = (e) => {
  const temp_value = e.target.value
  e.target.value = ''
  e.target.value = temp_value
}

const MemoizedRowField = memo(RowField)


export default Home;

type Action = {
  type: "delete",
  noteIds: bigint[],
  cardIds: bigint[]
}


type EditorStore = {
  isScrolling: () => boolean;
  lastScrollTime: Date;
  logScroll: () => void;

  rowHover: number | null;
  rowSelection: null | number | { anchor: number, cursor: number };
  getSelectionRange: () => [number, number];
  getSelectedNotes: <T extends { id: bigint }>(notes: T[]) => T[];

  fieldSelection: null | number;
  isEditing: boolean;
  setRowHover: (row: number | null) => void;
  setRowSelection: (row: number | { anchor: number, cursor: number } | null) => void;
  setFieldSelection: (field: number | null) => void;
  keyboardHandler: KeyboardEventHandler;

  // An event-based system makes managing history (& undos) easier
  on: <T extends Action>(action: T['type'], doHandler: () => T | Promise<T>, undoHandler: (action: T) => void) => void;
  off: <T extends Action>(action: T['type']) => void;
  doHandlers: { 'delete'?: () => Action };
  undoHandlers: { 'delete'?: (action: Action) => void };

  fire: (action: Action['type']) => void;
  undo: () => void;
  actions: Action[];

}


const useEditor = create<EditorStore>((set, get) => ({
  isScrolling: () => get().lastScrollTime.getTime() > (new Date().getTime() - 250),
  lastScrollTime: new Date(),
  logScroll: () => set({ lastScrollTime: new Date() }),

  rowHover: null,
  rowSelection: null,
  fieldSelection: null,
  isEditing: false,

  getSelectionRange: () => {
    const rowSelection = get().rowSelection

    if (rowSelection === null) {
      return [-1, -1]
    } else if (typeof rowSelection === "number") {
      return [rowSelection, rowSelection]
    }
    return [Math.min(rowSelection.anchor, rowSelection.cursor), Math.max(rowSelection.anchor, rowSelection.cursor)]
  },

  getSelectedNotes: <T extends { id: bigint }>(notes: T[]) => {
    const selectionRange = get().getSelectionRange();
    const indexes = range(selectionRange[0], selectionRange[1] + 1)
    return indexes.map(i => notes[i]).filter(Boolean) as T[]
  },

  setRowHover(row) {
    set({ rowHover: row })
  },
  setRowSelection(row) {
    set({ rowSelection: row })
  },
  setFieldSelection(field) {
    set({ fieldSelection: field })
  },

  keyboardHandler: (e) => {
    console.log({ e })
    if (typeof document !== "undefined") {
      const { rowSelection, rowHover, fieldSelection, isEditing, setRowSelection, setFieldSelection } = get();
      if (rowHover != null && rowSelection === null) {
        set({ rowSelection: rowHover })
        return;
      }
      const moveRow = (dY: number) => {
        console.log({ r: rowSelection, dY, shift: e.shiftKey })
        if (e.shiftKey) {
          if (rowSelection == null) {
            set({ rowSelection: { anchor: 0, cursor: 0 } })
          } else if (typeof rowSelection === "number") {
            set({ rowSelection: { anchor: rowSelection, cursor: rowSelection } })
          } else {
            set({ rowSelection: { ...rowSelection, cursor: rowSelection.cursor + dY } })
          }
        } else if (rowSelection == null) {
          set({ rowSelection: 0 })
        } else if (typeof rowSelection === "number") {
          set({ rowSelection: rowSelection + dY })
        }
        document.getElementById(`row-${rowSelection}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
      }

      const moveField = (dX: number) => {
        setFieldSelection((fieldSelection ?? 0) + dX)
      }

      const escape = () => {
        if (isEditing) {
          set({ isEditing: false })
        } else if (fieldSelection) {
          setFieldSelection(null)
        } else {
          setRowSelection(null)
        }
      }

      if (e.metaKey) {
        if ((e.code === "Delete" || e.code === "Backspace")) {
          get().fire("delete")
        } else if (e.key === "z") {
          get().undo()
        }
      } else if (e.code === "ArrowDown") {
        moveRow(1)
      } else if (e.code === "ArrowUp") {
        moveRow(-1)
      } else if (e.code === "ArrowRight") {
        moveField(1)
      } else if (e.code === "ArrowLeft") {
        moveField(-1)
      } else if (e.code === "Escape" || e.code === "Enter") {
        escape()
      } else if (focus === null && ["1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(e.key)) {
        setFieldSelection(parseInt(e.key))
      } else if (!isEditing && !["Tab", "ShiftLeft", "ShiftRight", "MetaRight", "MetaLeft", "ControlLeft", "ControlRight", "AltLeft", "AltRight"].includes(e.code)) {
        set({ isEditing: true })
      } else {
        return
      }
      e.preventDefault()
      e.stopPropagation()
    }
  },

  // Only one handler per event
  on(action, handler, undo) {
    set({
      doHandlers: { ...get().doHandlers, [action]: handler },
      undoHandlers: { ...get().undoHandlers, [action]: undo }
    })
  },
  off(action) {
    set({
      doHandlers: { ...get().doHandlers, [action]: undefined },
      undoHandlers: { ...get().undoHandlers, [action]: undefined }
    })
  },
  doHandlers: {},
  undoHandlers: {},

  async fire(actionType) {
    const action = await get().doHandlers?.[actionType]?.();

    if (action) {
      set({ actions: [...get().actions, action] })
    }
  },
  async undo() {
    const action = get().actions.pop()
    console.log(chalk.red("UNDO"), action)

    if (action) {
      get().undoHandlers[action.type]?.(action)
    }
  },
  actions: []

}))