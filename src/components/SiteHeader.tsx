"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { CSSProperties, MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { BagIcon, CloseIcon, HeartIcon, MenuIcon, SearchIcon } from "@/components/icons";
import LogoPlayOverlay, { type GameId } from "@/components/LogoPlayOverlay";
import { useShop } from "@/providers/ShopProvider";

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function shuffleGames(source: GameId[]) {
  const next = [...source];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

const navItems = [
  { href: "/", label: "Каталог" },
  { href: "/about", label: "О бренде" },
  { href: "/delivery", label: "Доставка" },
  { href: "/payment", label: "Оплата" },
  { href: "/faq", label: "FAQ" },
  { href: "/contacts", label: "Контакты" },
];

const gamePool: GameId[] = ["flappy", "dino", "snake", "memory"];

type FlyState = {
  left: number;
  top: number;
  size: number;
  tx: number;
  ty: number;
  scale: number;
};

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [playOpen, setPlayOpen] = useState(false);
  const [activeGame, setActiveGame] = useState<GameId>("flappy");
  const [scrolled, setScrolled] = useState(false);
  const [flyState, setFlyState] = useState<FlyState | null>(null);
  const sequenceRef = useRef<GameId[]>(shuffleGames(gamePool));
  const lastGameRef = useRef<GameId | null>(null);
  const openTimerRef = useRef<number | null>(null);
  const launchLockRef = useRef(false);
  const { state } = useShop();
  const cartCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    return () => {
      if (openTimerRef.current) {
        window.clearTimeout(openTimerRef.current);
      }
    };
  }, []);

  const getNextGame = () => {
    if (sequenceRef.current.length === 0) {
      const reshuffled = shuffleGames(gamePool);

      if (lastGameRef.current && reshuffled[0] === lastGameRef.current && reshuffled.length > 1) {
        [reshuffled[0], reshuffled[1]] = [reshuffled[1], reshuffled[0]];
      }

      sequenceRef.current = reshuffled;
    }

    const nextGame = sequenceRef.current.shift() ?? "flappy";
    lastGameRef.current = nextGame;
    return nextGame;
  };

  const handlePlayLaunch = (event: MouseEvent<HTMLButtonElement>) => {
    if (pathname !== "/") {
      router.push("/");
      return;
    }

    if (launchLockRef.current) {
      return;
    }

    launchLockRef.current = true;
    const nextGame = getNextGame();
    const trigger = event.currentTarget.querySelector<HTMLElement>(".brandmark-eye") ?? event.currentTarget;
    const rect = trigger.getBoundingClientRect();
    const startSize = rect.width || 34;
    const finalSize = 84;
    const targetLeft = (window.innerWidth - finalSize) / 2;
    const targetTop = (window.innerHeight - finalSize) / 2;

    setActiveGame(nextGame);
    setFlyState({
      left: rect.left,
      top: rect.top,
      size: startSize,
      tx: targetLeft - rect.left,
      ty: targetTop - rect.top,
      scale: finalSize / startSize,
    });

    if (openTimerRef.current) {
      window.clearTimeout(openTimerRef.current);
    }

    openTimerRef.current = window.setTimeout(() => {
      setPlayOpen(true);
      setFlyState(null);
      launchLockRef.current = false;
    }, 380);
  };

  const closePlay = () => {
    setPlayOpen(false);
    setFlyState(null);
    launchLockRef.current = false;
  };

  return (
    <>
      <header className={`site-header-shell ${scrolled ? "is-scrolled" : ""}`}>
        <div className="container site-header">
          <div className="header-mobile-trigger">
            <button type="button" className="header-icon-button mobile-only" onClick={() => setMenuOpen(true)} aria-label="Открыть меню">
              <MenuIcon className="icon" />
            </button>
          </div>

          <button type="button" className="brandmark brandmark-button" onClick={handlePlayLaunch} aria-label="Открыть мини-игру NO WOE">
            <span className="brandmark-eye" aria-hidden="true" />
            <span className="brandmark-copy">
              <strong>NO WOE</strong>
              <small>streetwear</small>
            </span>
          </button>

          <nav className="site-nav" aria-label="Основная навигация">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={isActive(pathname, item.href) ? "is-active" : ""}>
                {item.label}
              </Link>
            ))}
          </nav>

          <form action="/" className="header-search desktop-search">
            <SearchIcon className="icon" />
            <input type="search" name="q" placeholder="Поиск по каталогу" aria-label="Поиск по каталогу" />
          </form>

          <div className="header-actions">
            <button type="button" className="header-icon-button mobile-only" onClick={() => setSearchOpen(true)} aria-label="Открыть поиск">
              <SearchIcon className="icon" />
            </button>
            <Link href="/favorites" className={`header-icon-button desktop-only ${isActive(pathname, "/favorites") ? "is-active" : ""}`} aria-label="Избранное">
              <HeartIcon className="icon" />
              <span>{state.favorites.length}</span>
            </Link>
            <Link href="/cart" className={`header-icon-button cart-button ${isActive(pathname, "/cart") ? "is-active" : ""}`} aria-label="Корзина">
              <BagIcon className="icon" />
              <span key={cartCount} className="cart-count">
                {cartCount}
              </span>
            </Link>
          </div>
        </div>
      </header>

      <div className={`drawer-backdrop ${menuOpen ? "is-open" : ""}`}>
        <div className="drawer-backdrop-scrim" onClick={() => setMenuOpen(false)} />
        <aside className={`side-drawer ${menuOpen ? "is-open" : ""}`} onClick={(event) => event.stopPropagation()}>
          <div className="drawer-head">
            <strong>Меню</strong>
            <button type="button" className="header-icon-button" onClick={() => setMenuOpen(false)} aria-label="Закрыть меню">
              <CloseIcon className="icon" />
            </button>
          </div>

          <nav className="drawer-nav" aria-label="Навигация по сайту">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={isActive(pathname, item.href) ? "is-active" : ""} onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
            <Link href="/favorites" className={isActive(pathname, "/favorites") ? "is-active" : ""} onClick={() => setMenuOpen(false)}>
              Избранное
            </Link>
            <Link href="/cart" className={isActive(pathname, "/cart") ? "is-active" : ""} onClick={() => setMenuOpen(false)}>
              Корзина
            </Link>
          </nav>
        </aside>
      </div>

      <div className={`drawer-backdrop ${searchOpen ? "is-open" : ""}`}>
        <div className="drawer-backdrop-scrim" onClick={() => setSearchOpen(false)} />
        <div className={`search-sheet ${searchOpen ? "is-open" : ""}`} onClick={(event) => event.stopPropagation()}>
          <div className="drawer-head">
            <strong>Поиск</strong>
            <button type="button" className="header-icon-button" onClick={() => setSearchOpen(false)} aria-label="Закрыть поиск">
              <CloseIcon className="icon" />
            </button>
          </div>

          <form action="/" className="header-search search-sheet-form">
            <SearchIcon className="icon" />
            <input type="search" name="q" placeholder="Название или ключевое слово" aria-label="Поиск по каталогу" />
            <button type="submit" className="button button-primary">
              Найти
            </button>
          </form>
        </div>
      </div>

      {flyState ? (
        <span
          className="brandmark-play-fly"
          style={
            {
              "--fly-left": `${flyState.left}px`,
              "--fly-top": `${flyState.top}px`,
              "--fly-size": `${flyState.size}px`,
              "--fly-x": `${flyState.tx}px`,
              "--fly-y": `${flyState.ty}px`,
              "--fly-scale": `${flyState.scale}`,
            } as CSSProperties
          }
          aria-hidden="true"
        />
      ) : null}

      {playOpen ? <LogoPlayOverlay game={activeGame} onClose={closePlay} /> : null}
    </>
  );
}

