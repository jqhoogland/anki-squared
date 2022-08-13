import type { NextPage } from "next";
import Head from "next/head";
import React, { FocusEventHandler, HTMLProps, KeyboardEventHandler, memo, UIEvent, UIEventHandler, useCallback, useMemo, useRef, useState } from "react";
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
import { updatePaginatedItem } from '../utils/pagination';
import create from "zustand";
import shallow from "zustand/shallow";
import { useVirtual } from "@tanstack/react-virtual"

type TechnologyCardProps = {
  name: string;
  description: string;
  documentation: string;
};

const Home: NextPage = () => {
  const queryParams = useFilterParams();
  const { data, fetchNextPage, isLoading } = trpc.proxy.notes.paginate.useInfiniteQuery(queryParams, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    refetchOnWindowFocus: false,

  })

  const { data: noteTypes } = trpc.proxy.notes.types.useQuery();
  const notes = useMemo(() => (data?.pages ?? []).flatMap(page => page.items), [data])

  const getNoteType = useCallback((ntid: bigint) => {
    return noteTypes?.find(nt => nt.id === ntid)
  }, [noteTypes])


  const handleScroll = useCallback<UIEventHandler<HTMLDivElement>>(
    (e) => {
      // @ts-ignore
      const bottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 300;
      if (bottom) {
        fetchNextPage()
      }
    }, [fetchNextPage])

  const parentRef = useRef<HTMLDivElement | null>(null)
  const rowVirtualizer = useVirtual({
    parentRef,
    size: notes.length,
    estimateSize: useCallback(() => 100, []),
  })

  console.log({ notes, getNoteType, handleScroll, parentRef, rowVirtualizer })
  // onScroll={handleScroll}
  return (
    <>
      <Head>
        <title>Anki Squared</title>
        <meta name="description" content="An superpowered interface to your Anki notes" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <main className="w-[max-content] min-w-[calc(100vw-20rem)]">
          <header className="navbar bg-b[ase-200 px-4 w-full h-16 min-w-[calc(100vw-20rem)]">
            <Filters />
          </header>
          <div
            ref={parentRef}
            className="h-[calc(100vh-4rem)] overflow-y-auto w-[max-content] min-w-[calc(100vw-20rem)]"
          >
            <div
              className="flex flex-col divide-y w-[max-content] relative min-w-[calc(100vw-20rem)]"
              style={{ height: `${rowVirtualizer.totalSize}px`, position: "relative" }}
            >
              {rowVirtualizer.virtualItems.map((virtualItem) => (
                <NoteRow
                  note={notes[virtualItem.index]!}
                  type={getNoteType(notes[virtualItem.index]!.ntid)}
                  index={virtualItem.index}
                  key={virtualItem.key}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
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
    </>
  );
};


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
    <div className="grid grid-cols-6 h-screen overflow-hidden">
      <aside className="col-span-1 bg-base-300">
        <header className="px-4 pt-4 pb-2 border-b">
          <h1 className="text-3xl leading-normal font-extrabold ">
            Anki<sup className="text-sky-500">2</sup>
          </h1>
        </header>
        <nav className="p-4 ">
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
  const handleKeyDown = useMemo(() => editor.createKeyboardHandler(index), [editor, index])


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
      tabIndex={0}
      onMouseOver={() => editor.setRowHover(index)}
      {...props}
      className={
        clsx(
          "flex flex-row divide-x-2 w-full focus:bg-base-200 focus:border-y-2 outline-none",
          editor.rowHover === index && "bg-base-200",
          props.className
        )
      }
      onKeyDown={handleKeyDown}
    >
      <div className="flex justify-center items-center px-4">
        {statusIcon}
      </div>
      {note.fields.map((field, i) => (
        <MemoizedRowField key={i} row={index} col={i} field={field} label={modelFields[i]?.name} />
      ))}
    </div>
  )
}


const RowField = ({ label, field, row, col }: { label: string | undefined, field: string, row: number, col: number }) => {
  const [isEditing, fieldSelection, setFieldSelection] = useEditor(store => [store.isEditing, store.fieldSelection, store.setFieldSelection], shallow);

  const select = useCallback(() => setFieldSelection(col), [col, setFieldSelection]);

  return (
    <div
      className="flex flex-1 flex-col px-2 min-w-[150px] overflow-hidden focus:bg-base-200"
      onClick={select}
    >
      <label className="w-full text-xs opacity-50 pt-2">{label}</label>
      {
        (isEditing && fieldSelection === col) ?
          <textarea defaultValue={field} autoFocus className="h-full focus:bg-base-200" onFocus={moveCaretToEnd} />
          : <div dangerouslySetInnerHTML={{ __html: field }} />
      }
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


type EditorStore = {
  rowHover: number | null,
  rowSelection: null | number | [number, number],
  fieldSelection: null | number,
  isEditing: boolean,
  setRowHover: (row: number | null) => void,
  setRowSelection: (row: number | [number, number] | null) => void,
  setFieldSelection: (field: number | null) => void,
  createKeyboardHandler: (index: number) => (e: KeyboardEvent) => void,
}


const useEditor = create<EditorStore>((set, get) => ({
  rowHover: null,
  rowSelection: null,
  fieldSelection: null,
  isEditing: false,

  setRowHover(row) {
    set({ rowHover: row })
  },
  setRowSelection(row) {
    set({ rowSelection: row })
  },
  setFieldSelection(field) {
    set({ fieldSelection: field })
  },

  createKeyboardHandler: (index) => (e) => {
    if (typeof document !== "undefined") {
      const { rowSelection, rowHover, fieldSelection, isEditing, setRowSelection, setFieldSelection } = get();

      const moveRow = (dY: number) => {
        if (e.shiftKey) {
          if (Array.isArray(rowSelection)) {
            if (index === rowSelection[0]) {
              setRowSelection([index + dY, rowSelection[1]])
            } else {
              setRowSelection([rowSelection[0], index + dY])
            }
          } else {
            setRowSelection([index, index])
          }
        } else {
          setRowSelection(index + dY)
        }
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

      if (e.code === "ArrowDown") {
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
  }

}))