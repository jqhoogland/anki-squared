import React, { HTMLProps, useCallback, useState } from "react";
import { trpc } from "../utils/trpc";
import { DeckWithChildren } from "../server/router/decks";
import { HiChevronDown } from "react-icons/hi";
import clsx from "clsx";
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useRouter } from "next/router";

export const Filters = () => {
    const router = useRouter();
    const status = useFilterParams().status;
    const toggleStatus = useCallback(() => {
        router.query.status = status === 'queue' ? undefined : status === 'ready' ? 'queue' : 'ready';
        router.push(router);
    }, [router, status]);

    return (
        // TODO: Dropdown menu
        <button className="btn btn-sm btn-outline" onClick={toggleStatus}>{status ?? "No Filters"}</button>
    );
};
export const Layout: React.FC<HTMLProps<HTMLDivElement>> = ({ children, ...props }) => {
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
    );
};
const DeckLI: React.FC<{ deck: DeckWithChildren; }> = ({ deck }) => {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const select = () => {
        router.query.did = deck.id.toString();
        router.push(router);
    };
    const toggle = () => {
        select();
        setIsOpen(o => !o);
    };
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
                    </ul>}
            </li>
        );
    }

    return (
        <li className="text-sm gap-1 flex ">
            <button onClick={select} className="cursor-pointer hover:bg-base-200 flex gap-1 items-center px-2 truncate rounded-lg">
                {deck.name}
            </button>
        </li>
    );
};
export const useFilterParams = () => {
    const router = useRouter();
    const queryParams: { did?: number | number[]; status?: "queue" | "ready"; } = {};

    if (router.query.status === "queue" || router.query.status === "ready") {
        queryParams.status = router.query.status as "queue" | "ready";
    }

    if (typeof router.query.did === "string") {
        queryParams.did = parseInt(router.query.did);
    } else if (Array.isArray(router.query.did)) {
        queryParams.did = router.query.did.map(parseInt);
    }

    return queryParams;
};
