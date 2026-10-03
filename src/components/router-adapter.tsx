'use client';

import React, { useEffect, type AnchorHTMLAttributes, type ReactNode } from 'react';
import NextLink, { type LinkProps as NextLinkProps } from 'next/link';
import {
  useRouter as useNextRouter,
  usePathname as useNextPathname,
  useParams as useNextParams,
  useSearchParams as useNextSearchParams,
} from 'next/navigation';

export type LinkProps = Omit<NextLinkProps, 'href'> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    href?: string | { pathname?: string; query?: Record<string, string> };
    to?: string;
    children?: ReactNode;
  };

export function Link({ href, to, children, className, onClick, ...rest }: LinkProps) {
  const target = href || to || '/';
  return (
    <NextLink href={target} className={className} onClick={onClick} {...rest}>
      {children}
    </NextLink>
  );
}

export function useNavigate() {
  const router = useNextRouter();
  return (to: string | number, options?: { replace?: boolean }) => {
    if (typeof to === 'number') {
      if (to === -1) router.back();
      return;
    }
    if (options?.replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  };
}

export function useLocation() {
  const pathname = useNextPathname();
  return {
    pathname: pathname || '/',
    search: '',
    hash: '',
    state: null,
    key: 'default',
  };
}

export function useParams<T extends Record<string, string | string[]>>() {
  const params = useNextParams();
  return (params || {}) as T;
}

export function useSearchParams(): [
  URLSearchParams,
  (params: URLSearchParams | Record<string, string>) => void
] {
  const nextSearchParams = useNextSearchParams();
  const router = useNextRouter();
  const pathname = useNextPathname();
  const currentParams = new URLSearchParams(nextSearchParams?.toString() || '');

  const setSearchParams = (newParams: URLSearchParams | Record<string, string>) => {
    const params = new URLSearchParams(newParams as Record<string, string>);
    router.push(`${pathname}?${params.toString()}`);
  };

  return [currentParams, setSearchParams];
}

export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const router = useNextRouter();
  useEffect(() => {
    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [router, to, replace]);
  return null;
}
