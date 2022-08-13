import type { NextPage } from "next";
import Head from "next/head";
import React, { HTMLProps, UIEvent, UIEventHandler, useCallback, useMemo, useRef, useState } from "react";
import { trpc } from "../utils/trpc";
import { Field, Note } from '@prisma/client';
import { NoteType } from '@prisma/client';
import { getParsedType } from "zod";
import { ParsedNote, ParsedNoteType } from "../server/router/notes";
import { DeckWithChildren } from "../server/router/decks";
import { HiChevronDown } from "react-icons/hi";
import { ImSpinner } from "react-icons/im";
import clsx from "clsx";
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { useRouter } from "next/router";
import { Html } from "next/document";

type TechnologyCardProps = {
  name: string;
  description: string;
  documentation: string;
};

const Home: NextPage = () => {
  const router = useRouter();
  const { data, fetchNextPage, isLoading } = trpc.proxy.notes.paginate.useInfiniteQuery({
    did: router.query.did
  }, {
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
            {notes.map(note => (
              <NoteRow note={note} type={getNoteType(note.ntid)} key={note.id.toString()} />
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

const NoteRow = ({ note, type }: { note: ParsedNote, type?: ParsedNoteType }) => {
  const modelFields = useMemo(() => (type?.fields ?? []).sort((a, b) => a.ord - b.ord), [type?.fields])

  if (!type) {
    console.error("No type found for note", note)
    return <></>
  }

  return (
    <div className="px-4 py-2" key={note.id.toString()}>
      <div className="grid grid-cols-4 text-xs opacity-50">{modelFields.map((field, i) => <span key={i}>{field.name}</span>)}</div>
      <div className="grid grid-cols-4">{note.fields.map((field, i) => <div className="" key={i}>{field}</div>)}</div>
    </div>
  )
}



export default Home;
