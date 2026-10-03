'use client';

import { useState, useEffect } from "react"
import { Link, Navigate, useSearchParams } from "../components/router-adapter"
import { PRODUCTS, formatPrice } from "../data"
import type { Order } from "../data"
import { useWishlist, useStore } from "../store"
import { Tabs, Badge, Button, EmptyState, Input } from "../components/ui"
import ProductCard from "../components/ProductCard"
import { authClient } from "../lib/auth/client"

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
  const guestWishlist = !state.customerUser && !state.customerPreview && tab === "Wishlist"
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  useEffect(() => {
    async function loadUserOrders() {
      if (!state.customerUser?.email) return
      setLoadingOrders(true)
      try {
        const res = await fetch("/api/orders")
        const data = await res.json()
        if (data.orders && Array.isArray(data.orders)) {
          const userOrders = data.orders.filter(
            (o: Order) => o.customer?.email?.toLowerCase() === state.customerUser?.email?.toLowerCase()
          )
          setOrders(userOrders)
        }
      } catch (err) {
        console.error("Failed to load customer orders:", err)
      } finally {
        setLoadingOrders(false)
      }
    }
    loadUserOrders()
  }, [state.customerUser?.email])

  async function handleSignOut() {
    try {
      await authClient.signOut()
    } catch {}
    dispatch({ type: "END_CUSTOMER_PREVIEW" })
    dispatch({
      type: "ADD_TOAST",
      toast: { id: String(Date.now()), message: "Signed out successfully", type: "info" },
    })
  }

  if (!state.customerUser && !state.customerPreview && !guestWishlist)
    return <Navigate to="/sign-in" replace />

  return (
    <div className="bg-ivory min-h-screen">
      <div className="bg-black text-ivory py-14 px-6 text-center">
        <p className="text-gold text-xs uppercase tracking-widest mb-2">
          {guestWishlist ? "Your favourites" : state.customerUser ? `Welcome, ${state.customerUser.name}` : "My Account"}
        </p>
        <div role="heading" aria-level={1} className="font-serif text-3xl">
          {guestWishlist ? "Your Wishlist" : state.customerUser ? state.customerUser.name : "Your Personal Edit"}
        </div>
        <p className="text-sm text-ivory/60 mt-3">
          {guestWishlist
            ? "Beautiful pieces, saved for later."
            : state.customerUser
              ? `Member since 2024 · ${state.customerUser.email}`
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
              {state.customerUser ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="active">Active Customer Account</Badge>
                    <span className="text-xs text-stone font-sans">{state.customerUser.email}</span>
                  </div>
                  <p className="text-xs text-stone">
                    Your orders and preferences are securely synchronized with Neon Auth.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Badge variant="warning">Preview only — not signed in</Badge>
                  <p className="text-xs text-stone">
                    You are exploring the account in preview mode. Sign in to link your real orders.
                  </p>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
              >
                {state.customerUser ? "Sign out" : "Exit preview"}
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
            <div className="space-y-6">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-white border border-border p-6 flex flex-col justify-between">
                  <p className="text-xs text-stone uppercase tracking-wider">Wishlist Items</p>
                  <p className="font-serif text-3xl text-charcoal mt-2">{ids.length}</p>
                </div>
                <div className="bg-white border border-border p-6 flex flex-col justify-between">
                  <p className="text-xs text-stone uppercase tracking-wider">Total Orders</p>
                  <p className="font-serif text-3xl text-charcoal mt-2">{orders.length}</p>
                </div>
                <div className="bg-white border border-border p-6 flex flex-col justify-between">
                  <p className="text-xs text-stone uppercase tracking-wider">Account Status</p>
                  <p className="font-serif text-xl text-gold mt-2">Active Member</p>
                </div>
              </div>
              <div className="bg-white border border-border p-6">
                <h3 className="font-serif text-lg text-charcoal mb-2">Exclusive Bespoke Services</h3>
                <p className="text-xs text-stone leading-relaxed mb-4">
                  Raw Stitches offers customized tailoring and bespoke consultations for special events and collections.
                </p>
                <Link to="/contact">
                  <Button size="sm" variant="ghost">Book Consultation</Button>
                </Link>
              </div>
            </div>
          )}

          {tab === "My Orders" && (
            <div>
              {loadingOrders ? (
                <div className="bg-white border border-border p-8 text-center text-stone font-sans text-sm animate-pulse">
                  Loading your orders...
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div key={ord.id} className="bg-white border border-border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-mono text-sm font-semibold text-charcoal">{ord.orderNumber}</span>
                          <Badge variant={ord.deliveryStatus as any}>{ord.deliveryStatus}</Badge>
                        </div>
                        <p className="text-xs text-stone font-sans">
                          Placed on {ord.date} · {ord.items.length} {ord.items.length === 1 ? "item" : "items"} · {formatPrice(ord.total)}
                        </p>
                        <p className="text-xs text-stone/80 font-sans mt-1">
                          Ship to: {ord.address.city}, {ord.address.state}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link to={`/track/${ord.orderNumber}`}>
                          <Button size="sm">Track Order</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No orders yet"
                  description="When you place orders using this email address, they will appear here automatically."
                  action={
                    <Link to="/shop">
                      <Button>Explore the Collection</Button>
                    </Link>
                  }
                />
              )}
            </div>
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
            <div className="bg-white border border-border p-6 max-w-lg space-y-4">
              <h3 className="font-serif text-lg text-charcoal">Delivery Address</h3>
              <p className="text-xs text-stone font-sans leading-relaxed">
                Your preferred shipping location for seamless checkout.
              </p>
              <div className="space-y-3 pt-2">
                <Input label="Street Address" defaultValue="14 Bishop Street" />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="City" defaultValue="Port Harcourt" />
                  <Input label="State" defaultValue="Rivers" />
                </div>
                <Input label="Country" defaultValue="Nigeria" disabled />
                <Button size="sm" className="mt-2">Update Address</Button>
              </div>
            </div>
          )}

          {tab === "Profile" && (
            <div className="bg-white border border-border p-6 max-w-md space-y-5">
              <h3 className="font-serif text-lg text-charcoal">Profile Details</h3>
              <Input
                label="Full name"
                defaultValue={state.customerUser?.name || "Adaeze Okonkwo"}
              />
              <Input
                label="Email address"
                type="email"
                defaultValue={state.customerUser?.email || "customer@example.com"}
                disabled
              />
              <Input
                label="Phone number"
                type="tel"
                defaultValue={state.checkoutContact?.phone || "0812 345 6789"}
              />
              <Button size="sm">Save Changes</Button>
            </div>
          )}

          {tab === "Security" && (
            <div className="bg-white border border-border p-6 max-w-lg space-y-4">
              <div role="heading" aria-level={2} className="font-serif text-xl">
                Account Security
              </div>
              <p className="text-sm text-stone leading-relaxed">
                Authentication powered by Neon Managed Better Auth. Your passwords and session tokens are securely protected with encrypted tokens.
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-border mt-4">
                <div>
                  <p className="text-xs font-medium text-charcoal">Active Session</p>
                  <p className="text-[11px] text-stone">Connected via SSL</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
