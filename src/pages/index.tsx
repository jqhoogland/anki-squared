import type { NextPage } from "next";
import Head from "next/head";
import { useCallback, useMemo } from "react";
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

      <main className="mx-auto max-w-screen-md min-h-[100vh] py-16 px-8">
        <h1 className="text-5xl md:text-[5rem] leading-normal font-extrabold text-gray-700">
          Anki<sup className="text-sky-500">2</sup>
        </h1>
        <div className="flex flex-col gap-2">
          {notes.map(note => (
            <NoteRow note={note} type={getNoteType(note.ntid)} key={note.id.toString()} />
          ))}
        </div>
      </main>
    </>
  );
};

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
