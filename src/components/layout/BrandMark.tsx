import Link from "next/link";

export function BrandMark({ href = "/", sub = "Rental Records" }: { href?: string; sub?: string }) {
  return (
    <Link className="brand" href={href}>
      <span className="mark">R</span>
      <span>
        Rental Depot
        <small>{sub}</small>
      </span>
    </Link>
  );
}
