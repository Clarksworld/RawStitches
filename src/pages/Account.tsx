import { Link, Navigate, useSearchParams } from "react-router"
import { PRODUCTS } from "../data"
import { useWishlist, useStore } from "../store"
import { Tabs, Badge, Button, EmptyState, Input } from "../components/ui"
import ProductCard from "../components/ProductCard"

const TABS = [
  "Overview",
  "My Orders",
  "Wishlist",
  "Addresses",
  "Profile",
  "Security",
]

export default function Account() {
  const [params, setParams] = useSearchParams()
  const selected = params.get("tab")
  const tab =
    TABS.find((item) => item.toLowerCase().replaceAll(" ", "-") === selected) ??
    "Overview"
  const { ids } = useWishlist()
  const { state, dispatch } = useStore()
  const wishlisted = PRODUCTS.filter((product) => ids.includes(product.id))
  const guestWishlist = !state.customerPreview && tab === "Wishlist"

  if (!state.customerPreview && !guestWishlist)
    return <Navigate to="/sign-in" replace />

  return (
    <div className="bg-ivory min-h-screen">
      <div className="bg-black text-ivory py-14 px-6 text-center">
        <p className="text-gold text-xs uppercase tracking-widest mb-2">
          {guestWishlist ? "Your favourites" : "My Account"}
        </p>
        <div role="heading" aria-level={1} className="font-serif text-3xl">
          {guestWishlist ? "Your Wishlist" : "Your Personal Edit"}
        </div>
        <p className="text-sm text-ivory/60 mt-3">
          {guestWishlist
            ? "Beautiful pieces, saved for later."
            : "A preview of your future Raw Stitches account."}
        </p>
      </div>
      <div className="max-w-screen-lg mx-auto px-6 lg:px-12 py-10">
        {guestWishlist ? (
          <div className="bg-white border border-border p-5 mb-8 flex flex-wrap justify-between gap-4 items-center">
            <p className="text-sm text-stone">
              Saved on this browser. Cross-device saving will require a verified
              account.
            </p>
            <Link to="/sign-in?returnTo=%2Faccount%3Ftab%3Dwishlist">
              <Button variant="ghost" size="sm">
                Sign in / Create account
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white border border-border p-5 mb-8 flex flex-wrap justify-between gap-4 items-center">
              <div className="space-y-2">
                <Badge variant="warning">Preview only — not signed in</Badge>
                <p className="text-xs text-stone">
                  No real customer data is loaded. Connect authentication to
                  activate accounts.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch({ type: "END_CUSTOMER_PREVIEW" })}
              >
                Exit preview
              </Button>
            </div>
            <Tabs
              tabs={TABS}
              active={tab}
              onChange={(value) =>
                setParams({ tab: value.toLowerCase().replaceAll(" ", "-") })
              }
            />
          </>
        )}
        <div className="mt-8">
          {tab === "Overview" && (
            <>
              <div className="bg-white border border-border p-6 mb-6 flex items-center justify-between">
                <p className="text-sm text-stone">Pieces in your wishlist</p>
                <p className="font-serif text-3xl text-charcoal">
                  {ids.length}
                </p>
              </div>
              <EmptyState
                title="Your account, ready for the next chapter"
                description="Verified order history and saved details will appear here once secure accounts are connected."
                action={
                  <Link to="/shop">
                    <Button>Explore the Collection</Button>
                  </Link>
                }
              />
            </>
          )}
          {tab === "My Orders" && (
            <EmptyState
              title="No verified orders to display"
              description="Guest orders are not automatically attached to an account. Linking them will require email verification and a connected order database."
              action={
                <Link to="/shop">
                  <Button>Continue Shopping</Button>
                </Link>
              }
            />
          )}
          {tab === "Wishlist" &&
            (wishlisted.length ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {wishlisted.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Your wishlist is waiting for something beautiful"
                description="Save your favourite pieces while shopping. No account required."
                action={
                  <Link to="/shop">
                    <Button>Explore Collection</Button>
                  </Link>
                }
              />
            ))}
          {tab === "Addresses" && (
            <EmptyState
              title="No saved addresses"
              description="Address management will be available after secure accounts are connected. You can still enter your delivery address at guest checkout."
            />
          )}
          {tab === "Profile" && (
            <div className="max-w-md space-y-5">
              <Input
                label="Full name"
                placeholder="Your verified profile will appear here"
                disabled
              />
              <Input
                label="Email address"
                type="email"
                placeholder="Your verified email"
                disabled
              />
              <Input
                label="Phone number"
                type="tel"
                placeholder="Your phone number"
                disabled
              />
              <p className="text-sm text-stone">
                Profile changes require a connected account. No sample customer
                identity has been assigned to you.
              </p>
            </div>
          )}
          {tab === "Security" && (
            <div className="bg-white border border-border p-6 max-w-lg space-y-4">
              <div role="heading" aria-level={2} className="font-serif text-xl">
                Passwordless, verified access
              </div>
              <p className="text-sm text-stone leading-relaxed">
                The planned sign-in method uses a secure email link, so there is
                no password to store or reset. Email verification and
                server-side access controls must be connected before this is a
                real account.
              </p>
              <Button
                variant="ghost"
                onClick={() => dispatch({ type: "END_CUSTOMER_PREVIEW" })}
              >
                Exit account preview
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
