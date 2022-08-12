import type { NextPage } from "next";
import Head from "next/head";
import { useMemo } from "react";
import { trpc } from "../utils/trpc";

type TechnologyCardProps = {
  name: string;
  description: string;
  documentation: string;
};

const Home: NextPage = () => {
  const { data } = trpc.proxy.notes.paginate.useInfiniteQuery({ limit: 50 }, {
    getNextPageParam: (lastPage) => lastPage.nextCursor
  })

  const notes = useMemo(() => (data?.pages ?? []).flatMap(page => page.items), [data])

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
            <div className="" key={note.id.toString()}>
              <h2 className="">
                {note.flds}
              </h2>
            </div>
          ))}
        </div>
      </main>
    </>
  );
};

const TechnologyCard = ({
  name,
  description,
  documentation,
}: TechnologyCardProps) => {
  return (
    <section className="flex flex-col justify-center p-6 duration-500 border-2 border-gray-500 rounded shadow-xl motion-safe:hover:scale-105">
      <h2 className="text-lg text-gray-700">{name}</h2>
      <p className="text-sm text-gray-600">{description}</p>
      <a
        className="mt-3 text-sm underline text-violet-500 decoration-dotted underline-offset-2"
        href={documentation}
        target="_blank"
        rel="noreferrer"
      >
        Documentation
      </a>
    </section>
  );
};

export default Home;
