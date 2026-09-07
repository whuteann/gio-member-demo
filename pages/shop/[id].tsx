import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";
import { PRODUCTS } from "@/lib/blueprints";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";

// This page stands in for the EXISTING Gio commerce product page — the
// System Outline is explicit that product/cart/checkout are external and
// not owned by this application. It's a clearly-labelled boundary stub,
// not a real storefront.
export default function ShopProductPage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : null;
  const product = PRODUCTS.find((p) => p.id === id);

  return (
    <>
      <Head><title>Gio Store (demo)</title></Head>
      <div className="mx-auto flex min-h-screen max-w-lg flex-col gap-5 px-5 py-10">
        <Chip tone="neutral">↗ Existing Gio Store (external, demo)</Chip>
        {product ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://picsum.photos/seed/${product.imageSeed}/800/600`}
              alt={product.title}
              className="w-full rounded-[1.75rem] object-cover"
            />
            <div>
              <h1 className="font-display text-2xl font-semibold text-foreground">{product.title}</h1>
              <p className="mt-1 text-lg font-semibold text-accent">${product.price}</p>
            </div>
            <p className="text-sm text-foreground-muted">
              This is a placeholder for the existing Gio product page. In production, this link
              opens the real Gio catalogue, cart and checkout — this member app does not own
              commerce.
            </p>
            <Button size="lg" disabled>
              Checkout on Gio Store (demo)
            </Button>
          </>
        ) : (
          <p className="text-sm text-foreground-muted">Product not found.</p>
        )}
        <Link href="/recommendation" className="text-sm font-semibold text-primary">
          ← Back to recommendations
        </Link>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => ({ props: {} });
