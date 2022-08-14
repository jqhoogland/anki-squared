import type { NextPage } from "next";
import Head from "next/head";
import { FocusEventHandler, HTMLProps, KeyboardEventHandler, memo, UIEvent, UIEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { trpc } from "../utils/trpc";
import { Field, Note } from '@prisma/client';
import { NoteType } from '@prisma/client';
import { getParsedType } from "zod";
import { ParsedNote, ParsedNoteType } from "../server/router/notes";
import { HiCheck, HiClock } from "react-icons/hi";
import { ImSpinner } from "react-icons/im";
import clsx from "clsx";
import { updatePaginatedItem, removePaginatedItems } from '../utils/pagination';
import create from "zustand";
import shallow from "zustand/shallow";
import { useVirtual } from "@tanstack/react-virtual"
import useEvent from "react-use/lib/useEvent";
import range from "lodash-es/range"
import { UseInfiniteQueryOptions, UseQueryOptions } from "react-query";
import chalk from 'chalk';
import * as Portal from "@radix-ui/react-portal";
import * as Dialog from "@radix-ui/react-dialog";
import { useFilterParams, Layout, Filters } from "../components/layouts";
import { useKeyPress, useKeyPressEvent } from "react-use";
import { useForm } from "react-hook-form";

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

const useNoteTypes = (props: UseQueryOptions = {}) => {
  const { data: noteTypes } = trpc.proxy.notes.types.useQuery(props as any);

  const getNoteType = useCallback((ntid: bigint) => {
    return noteTypes?.find(nt => nt.id === ntid)
  }, [noteTypes])

  return { noteTypes, getNoteType }
}

const Home: NextPage = () => {
  const { notes, isLoading, fetchNextPage } = useNotes();
  const { getNoteType } = useNoteTypes();

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
              className="flex flex-col divide-y w-[max-content] relative min-w-[calc(100vw-13rem)] overflow-x-auto items-stretch overflow-y-hidden"
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
      <NoteEditor />
    </>
  );
};

const NoteEditor = () => {
  const [isEditing, toggleIsEditing, rowSelection] = useEditor(store => [store.isEditing, store.toggleIsEditing, store.rowSelection], shallow)

  return (
    <Dialog.Root open={isEditing && rowSelection != null}>
      <Dialog.Overlay className="modal modal-open fixed top-0 left-0" onClick={() => toggleIsEditing(false)}>
        <Dialog.Content className="modal-box" onClick={(e) => e.stopPropagation()}>
          <NoteEditorForm />
        </Dialog.Content>
      </Dialog.Overlay>
    </Dialog.Root>
  )
}

const NoteEditorForm = () => {
  const { notes, queryParams } = useNotes({ refetchOnMount: false });
  const { getNoteType } = useNoteTypes({ refetchOnMount: false });
  const [rowSelection, fieldSelection] = useEditor(store => [store.rowSelection, store.fieldSelection], shallow)

  // TODO: Optimistic update
  const { mutate: update } = trpc.proxy.notes.update.useMutation();

  const note = useMemo(() => {
    const note = typeof rowSelection == "number" && notes?.[rowSelection];
    if (!note) {
      return null;
    }
    const type = getNoteType(note.ntid);

    return {
      ...note,
      type,
    }
  }, [notes, rowSelection, getNoteType])

  const onSubmit = useCallback((_fields: { [key: `${number}`]: string }) => {
    if (note?.id) {
      const fields: string[] = new Array(Object.keys(_fields).length);

      for (const [key, value] of Object.entries(_fields)) {
        fields[parseInt(key)] = value;
      }

      update({ id: note.id, fields })
    }
  }, [note, update])

  const { register, handleSubmit } = useForm({
    // @ts-ignore
    defaultValues: Array.isArray(note?.fields) ? { ...note?.fields } : undefined
  })

  const handleKeyDown = useCallback<KeyboardEventHandler>((e) => {
    if (e.metaKey && e.code === "Enter") {
      handleSubmit(onSubmit)()
    }
  }, [handleSubmit, onSubmit])

  return (
    <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown}>
      <h1 className="text-xl font-bold">{note?.type?.name}</h1>
      {
        note?.type?.fields.map((field, i) => (
          <div key={field.name} className="field-set flex flex-col gap-2">
            <label className="label label-text">{field.name}</label>
            <textarea className="textarea textarea-bordered"
              autoFocus={(fieldSelection === i) || !(fieldSelection || i)}
              rows={5}
              onFocus={moveCaretToEnd}
              {...register(`${i}`)}
            />
          </div>
        ))
      }
    </form>
  )
}

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
      onClick={() => editor.toggleIsEditing()}
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
      id={`row - ${index} `}
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

  const [isEditing, rowSelection, fieldSelection, setFieldSelection] =
    useEditor(store => [store.isEditing, store.rowSelection, store.fieldSelection, store.setFieldSelection], shallow);
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
      <div className={clsx("w-full h-[max-content]")}
        onClick={select}
      >
        <label className="w-full text-xs opacity-50 pt-2">{label}</label>
        <div dangerouslySetInnerHTML={{ __html: field }} className="prose" />
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
  }, [isHovering, label, fieldSelection, col, field, isEditing, logScroll])

  return (
    <div
      className={
        "flex flex-1 flex-col min-w-[150px] overflow-hidden px-2"
      }
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
  toggleIsEditing: (optional?: boolean) => void;

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
  toggleIsEditing: (optional) => {
    set({
      isEditing: optional !== undefined ? optional : !get().isEditing,
      rowSelection: get().rowSelection ?? get().rowHover
    })
  },

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
    console.log({ e, editor: get() })
    if (typeof document !== "undefined") {
      const { rowSelection, rowHover, fieldSelection, isEditing, setRowSelection, setFieldSelection } = get();
      if (rowHover != null && rowSelection === null) {
        set({ rowSelection: rowHover })
        return;
      }

      if (isEditing) {
        return
      }

      const moveRow = (dY: number) => {
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
        // document.getElementById(`row - ${ rowSelection } `)?.scrollIntoView({ behavior: "smooth", block: "center" })
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
      } else if (!isEditing && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
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