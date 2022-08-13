import type { NextPage } from "next";
import Head from "next/head";
import React, { FocusEventHandler, HTMLProps, KeyboardEventHandler, UIEvent, UIEventHandler, useCallback, useMemo, useRef, useState } from "react";
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
import { Html } from "next/document";
import { updatePaginatedItem } from '../utils/pagination';

type TechnologyCardProps = {
  name: string;
  description: string;
  documentation: string;
};

const Home: NextPage = () => {
  const queryParams = useFilterParams();
  const { data, fetchNextPage, isLoading } = trpc.proxy.notes.paginate.useInfiniteQuery(queryParams, {
    getNextPageParam: (lastPage) => lastPage.nextCursor
  })

  const { data: noteTypes } = trpc.proxy.notes.types.useQuery();
  const notes = useMemo(() => (data?.pages ?? []).flatMap(page => page.items), [data])

  const getNoteType = useCallback((ntid: bigint) => {
    return noteTypes?.find(nt => nt.id === ntid)
  }, [noteTypes])


  const handleScroll = useCallback<UIEventHandler<HTMLDivElement>>(
    (e) => {
      const bottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 300;
      if (bottom) {
        fetchNextPage()
      }
    }, [fetchNextPage])

  return (
    <>
      <Head>
        <title>Anki Squared</title>
        <meta name="description" content="An superpowered interface to your Anki notes" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout onScroll={handleScroll}>
        <main className="min-h-[100vh]py-16" >
          <div className="flex flex-col gap-2 divide-y">
            {notes.map((note, i) => (
              <NoteRow note={note} type={getNoteType(note.ntid)} key={note.id.toString()} index={i} />
            ))}
          </div>
          {isLoading &&
            <div className="w-full flex items-center justify-center py-4"><ImSpinner className="animate-spin" /></div>}
        </main>
      </Layout>
    </>
  );
};

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
      <div className="col-span-5 overflow-y-scroll" {...props}>
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
  const queryParams: Record<string, any> = { ...router.query };

  if (router.query.queue) {
    if (typeof router.query.queue === "string") {
      queryParams.queue = router.query.queue === "true" || router.query.queue === "1";
    } else {
      delete queryParams.queue;
    }
  }

  console.log({ queryParams }, router.query)

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



const NoteRow = ({ note, type, index }: { note: ParsedNote, type?: ParsedNoteType, index: number }) => {
  const toggleStatus = useToggleStatus(note.id, note.status)

  const [focus, setFocus] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const modelFields = useMemo(() => (type?.fields ?? []).sort((a, b) => a.ord - b.ord), [type?.fields])

  const handleKeyDown = useCallback<KeyboardEventHandler>((e) => {
    if (typeof document !== "undefined") {
      const getId = (i: number) => focus != null ? `note-${i}-field-${focus}` : `note-${i}`;

      if (e.code === "ArrowDown") {
        document.getElementById(getId(index + 1))?.focus?.()
      } else if (e.code === "ArrowUp") {
        document.getElementById(getId(index - 1))?.focus?.()
      } else if (e.code === "ArrowRight") {
        let nextField = document.getElementById(`note-${index}-field-${(focus ?? -1) + 1}`)

        if (!nextField) {
          nextField = document.getElementById(`note-${index + 1}`)
        }

        nextField?.focus?.()

        if (isEditing) {
          setIsEditing((focus ?? -1) + 1)
        }
      } else if (e.code === "ArrowLeft") {
        let prevField = document.getElementById(`note-${index}-field-${(focus ?? -1) - 1}`)

        if (!prevField) {
          prevField = document.getElementById(`note-${index - 1}`)
        }
        prevField?.focus?.()

        if (isEditing) {
          setIsEditing((focus ?? -1) - 1)
        }

      } else if (e.code === "Escape") {
        // TODO: process enter
        setIsEditing(null)
      } else if (e.code === "Enter") {
        if (isEditing) {
          setIsEditing(null)
        } else {
          setFocus((focus ?? -1) + 1)
        }
      } else if (!isEditing && !["Tab", "ShiftLeft", "ShiftRight", "MetaRight", "MetaLeft", "ControlLeft", "ControlRight", "AltLeft", "AltRight"].includes(e.code)) {
        console.log(e.code)
        setIsEditing(focus)
      }
    }
  }, [index, focus, isEditing, setIsEditing])

  const moveCaretToEnd = useCallback<FocusEventHandler<HTMLTextAreaElement>>((e) => {
    const temp_value = e.target.value
    e.target.value = ''
    e.target.value = temp_value
  }, [])

  const statusIcon = useMemo(() => note.status === "queue"
    ? <HiClock className="bg-warning text-white btn btn-circle btn-xs" onClick={toggleStatus} />
    : <HiCheck className="bg-green-700 text-white btn btn-circle btn-xs" onClick={toggleStatus} />,
    [note.status, toggleStatus]
  );

  if (!type) {
    console.error("No type found for note", note)
    return <></>
  }


  return (
    <div
      className="py-2 flex flex-row divide-x-2 w-full"
      key={note.id.toString()}
      id={`note-${index}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="flex justify-center items-center px-4">
        {statusIcon}
      </div>
      {note.fields.map((field, i) => (
        <div
          className="flex flex-1 flex-col px-2 min-w-[150px] overflow-hidden"
          key={i}
          tabIndex={0}
          onFocus={() => setFocus(i)}
          onBlur={() => setFocus(null)}
          id={`note-${index}-field-${i}`}
          onClick={() => setIsEditing(i)}
        >
          <label key={i} className="w-full text-xs opacity-50 ">{modelFields[i]?.name}</label>
          {
            (isEditing === i) ?
              <textarea defaultValue={field} autoFocus className="h-full" onFocus={moveCaretToEnd} />
              : <div dangerouslySetInnerHTML={{ __html: field }} />
          }
        </div>
      ))}
    </div>
  )
}



export default Home;
