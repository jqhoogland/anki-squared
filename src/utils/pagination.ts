import { InfiniteData } from 'react-query';

export const updatePaginatedItem = <T extends { id: bigint }, S = number | undefined | null>(
    data: InfiniteData<{ items: T[]; nextCursor: S }> | null,
    id: bigint,
    updater: (item: T) => T,
): InfiniteData<{ items: T[]; nextCursor: S | null | undefined }> =>
    data
        ? {
            ...data,
            pages: data?.pages.map((page) => ({
                ...page,
                items: page.items.map((item: T) =>
                    item.id === id ? updater(item) : item,
                ),
            })),
        }
        : {
            pages: [],
            pageParams: [],
        };

export const replacePaginatedItem = <T extends { id: bigint }, S = number | undefined | null>(
    data: InfiniteData<{ items: T[]; nextCursor: S }> | null,
    id: bigint,
    item: T,
): InfiniteData<{ items: T[]; nextCursor: S | null | undefined }> =>
    data
        ? {
            ...data,
            pages: data?.pages.map((page) => ({
                ...page,
                items: page.items.map((prevItem) =>
                    prevItem.id === id ? item : prevItem,
                ),
            })),
        }
        : {
            pages: [{ items: [item], nextCursor: null }],
            pageParams: [],
        };

export const prependPaginatedItem = <T extends { id: bigint }, S = number | undefined | null>(
    data: InfiniteData<{ items: T[]; nextCursor: S }> | null,
    item: T,
): InfiniteData<{ items: T[]; nextCursor?: S | null | undefined }> =>
    data
        ? {
            ...data,
            pages: [
                { ...data.pages[0], items: [item, ...(data.pages[0]?.items ?? [])] },
                ...(data?.pages.slice(1, data?.pages.length) ?? []),
            ],
        }
        : {
            pages: [{ items: [item], nextCursor: null }],
            pageParams: [],
        };

export const appendPaginatedItem = <T extends { id: bigint }, S = number | undefined | null>(
    data: InfiniteData<{ items: T[]; nextCursor: S }> | null,
    item: T,
): InfiniteData<{ items: T[]; nextCursor?: S | null | undefined }> =>
    data
        ? {
            ...data,
            pages: [
                ...(data?.pages.slice(0, data?.pages.length - 1) ?? []),
                {
                    ...data.pages?.[data?.pages.length],
                    items: [item, ...(data.pages[0]?.items ?? [])],
                },
            ],
        }
        : {
            pages: [{ items: [item], nextCursor: null }],
            pageParams: [],
        };

export const removePaginatedItem = <T extends { id: bigint }, S = number | undefined | null>(
    data: InfiniteData<{ items: T[]; nextCursor: S }> | null,
    id: bigint,
) =>
    data
        ? {
            ...data,
            pages: data?.pages.map((page) => ({
                ...page,
                items: page.items.filter((item) => item.id !== id),
            })),
        }
        : {
            pages: [],
            pageParams: [],
        };


export const removePaginatedItems = <T extends { id: bigint }, S = number | undefined | null>(
    data: InfiniteData<{ items: T[]; nextCursor: S }> | null,
    ids: bigint[],
) =>
    data
        ? {
            ...data,
            pages: data?.pages.map((page) => ({
                ...page,
                items: page.items.filter((item) => !ids.includes(item.id)),
            })),
        }
        : {
            pages: [],
            pageParams: [],
        };
