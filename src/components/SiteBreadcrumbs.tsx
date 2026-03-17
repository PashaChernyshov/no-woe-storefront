"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getProductBySlug } from "@/lib/products";

type Crumb = {
  href: string;
  label: string;
};

const staticLabels: Record<string, string> = {
  about: "О бренде",
  cart: "Корзина",
  catalog: "Каталог",
  contacts: "Контакты",
  delivery: "Доставка",
  favorites: "Избранное",
  faq: "FAQ",
  payment: "Оплата",
};

function getLabel(segments: string[], index: number) {
  const segment = segments[index];
  const parent = segments[index - 1];

  if (parent === "catalog") {
    return getProductBySlug(segment)?.name ?? segment;
  }

  return staticLabels[segment] ?? segment;
}

export default function SiteBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs: Crumb[] = [
    {
      href: "/",
      label: "Каталог",
    },
  ];

  let currentPath = "";
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    if (currentPath === "/") {
      return;
    }

    if (currentPath === "/catalog") {
      return;
    }

    crumbs.push({
      href: currentPath,
      label: getLabel(segments, index),
    });
  });

  return (
    <nav className="site-breadcrumbs" aria-label="Путь по сайту">
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;

        return (
          <span key={crumb.href} className="site-breadcrumbs-item">
            {index > 0 ? <span className="site-breadcrumbs-separator">/</span> : null}
            {isLast ? <span className="site-breadcrumbs-current">{crumb.label}</span> : <Link href={crumb.href}>{crumb.label}</Link>}
          </span>
        );
      })}
    </nav>
  );
}
