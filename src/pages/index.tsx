import type { NextPage } from "next";
import Head from "next/head";
import React, { useCallback, useMemo } from "react";
import { trpc } from "../utils/trpc";
import { Field, Note } from '@prisma/client';
import { NoteType } from '@prisma/client';
import { getParsedType } from "zod";
import { ParsedNote, ParsedNoteType } from "../server/router/notes";

type TechnologyCardProps = {
  name: string;
  description: string;
  documentation: string;
};

const Home: NextPage = () => {
  const { data } = trpc.proxy.notes.paginate.useInfiniteQuery({}, {
    getNextPageParam: (lastPage) => lastPage.nextCursor
  })

  const { data: noteTypes } = trpc.proxy.notes.types.useQuery();
  const notes = useMemo(() => (data?.pages ?? []).flatMap(page => page.items), [data])

  const getNoteType = useCallback((ntid: bigint) => {
    return noteTypes?.find(nt => nt.id === ntid)
  }, [noteTypes])


  return (
    <>
      <Head>
        <title>Anki Squared</title>
        <meta name="description" content="An superpowered interface to your Anki notes" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <main className="min-h-[100vh]py-16">
          <div className="flex flex-col gap-2 divide-y">
            {notes.map(note => (
              <NoteRow note={note} type={getNoteType(note.ntid)} key={note.id.toString()} />
            ))}
          </div>
        </main>
      </Layout>
    </>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="grid grid-cols-6">
      <aside className="col-span-1 bg-base-300">
        <header className="px-4 pt-4 pb-2 border-b">
          <h1 className="text-3xl leading-normal font-extrabold ">
            Anki<sup className="text-sky-500">2</sup>
          </h1>
        </header>
      </aside>
      <div className="col-span-5">
        {children}
      </div>
    </div>
  )
}

const NoteRow = ({ note, type }: { note: ParsedNote, type?: ParsedNoteType }) => {
  if (!type) {
    console.error("No type found for note", note)
    return <></>
  }

  const modelFields = type.fields.sort((a, b) => a.ord - b.ord)


  return (
    <div className="" key={note.id.toString()}>
      {note.fields.map((field, i) => <p key={i}><b>{modelFields[i]?.name}</b>: {field}</p>)}
    </div>
  )
}



export default Home;
