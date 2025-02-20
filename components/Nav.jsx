import Link from "next/link";

const Nav = () => {
  return (
    <div>
      <nav>
        <Link href="/">Home </Link>

        <Link href="/rankings"> Rankings </Link>

        <Link href="/stats"> Stats </Link>

        <Link href="/clans"> Clans</Link>
      </nav>
    </div>
  );
};

export default Nav;
