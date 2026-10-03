'use client';

import { useEffect, useState } from "react"
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "../components/router-adapter"
import { Button, Input, Badge } from "../components/ui"
import { useStore } from "../store"
const logo = "/raw-stitches-logo.png"

export default function CustomerAccess() {
  const location = useLocation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { state, dispatch } = useStore()
  const registering = location.pathname === "/create-account"
  const recovering = location.pathname === "/account-access"
  const requestedReturn = params.get("returnTo")
  const returnTo = ["/checkout", "/account?tab=wishlist"].includes(
    requestedReturn ?? "",
  )
    ? requestedReturn!
    : "/account"
  const [name, setName] = useState(state.checkoutContact?.name ?? "")
  const [email, setEmail] = useState(state.checkoutContact?.email ?? "")
  const [notice, setNotice] = useState(false)

  useEffect(() => {
    setNotice(false)
  }, [location.pathname])

  if (state.customerPreview) return <Navigate to={returnTo} replace />

  const title = registering
    ? "A little more personal."
    : recovering
      ? "Find your way back."
      : "Welcome back."
  const modeLink = (path: string) =>
    `${path}?returnTo=${encodeURIComponent(returnTo)}`

  return (
    <div className="bg-ivory py-12 lg:py-20 px-6">
      <div className="max-w-screen-lg mx-auto grid lg:grid-cols-2 border border-border">
        <div className="bg-black p-8 lg:p-12 flex flex-col justify-between text-ivory">
          <img
            src={logo}
            alt="Raw Stitches Nigeria Enterprise"
            className="w-44 mb-12"
          />
          <div>
            <p className="text-gold text-xs tracking-widest uppercase mb-4">
              Your Raw Stitches account
            </p>
            <div className="font-serif text-4xl leading-tight mb-6">
              Your style.
              <br />
              <span className="italic text-gold">Your own space.</span>
            </div>
            <p className="text-ivory/70 text-sm leading-relaxed mb-8">
              A place for your favourite pieces, order history and details for
              your next visit.
            </p>
            <div className="space-y-4 text-sm text-ivory/70 border-t border-ivory/20 pt-6">
              <p>Keep your favourites close</p>
              <p>Find your orders in one place</p>
              <p>Make your next checkout simpler</p>
            </div>
          </div>
          <p className="mt-12 text-xs text-ivory/50">
            An account is always optional. Shopping is not.
          </p>
        </div>
        <div className="bg-white p-8 lg:p-12">
          <Badge variant="warning">Account flow preview</Badge>
          <div
            role="heading"
            aria-level={1}
            className="font-serif text-3xl text-charcoal mt-6 mb-3"
          >
            {title}
          </div>
          <p className="text-sm text-stone leading-relaxed mb-7">
            {registering
              ? "Create an account with a verified email link. No password to remember."
              : "Sign in with a secure link sent to your email. No password needed."}
          </p>
          <div className="bg-ivory border border-border p-4 mb-6 text-xs text-stone leading-relaxed">
            Authentication is not connected yet. Use sample details to explore
            this screen; no account will be created and no email will be sent.
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              setNotice(true)
            }}
            className="space-y-5"
          >
            {registering && (
              <Input
                label="Full name"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={100}
              />
            )}
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              maxLength={254}
            />
            <Button type="submit" size="lg" className="w-full">
              {registering
                ? "Create account with email"
                : "Continue with email"}
            </Button>
            {notice && (
              <p role="status" className="text-sm text-stone leading-relaxed">
                Email delivery and verification require the authentication
                backend. Nothing was sent or saved. You can explore the account
                preview below.
              </p>
            )}
          </form>
          <p className="mt-4 text-xs text-stone leading-relaxed">
            Creating an account will not subscribe you to marketing. Guest
            orders will only be linked after email ownership is verified.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to={modeLink(registering ? "/sign-in" : "/create-account")}
              className="text-sm text-gold hover:underline"
            >
              {registering
                ? "Already have an account? Sign in"
                : "New here? Create an account"}
            </Link>
            {!recovering && !registering && (
              <Link
                to={modeLink("/account-access")}
                className="text-xs text-stone hover:text-gold"
              >
                Need help accessing your account?
              </Link>
            )}
          </div>
          <div className="border-t border-border mt-7 pt-6 space-y-3">
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                dispatch({ type: "START_CUSTOMER_PREVIEW" })
                navigate(returnTo, { replace: true })
              }}
            >
              Explore account preview
            </Button>
            <Link
              to={returnTo === "/checkout" ? "/checkout" : "/shop"}
              className="block text-center text-xs text-stone hover:text-gold"
            >
              {returnTo === "/checkout"
                ? "Continue checkout as a guest"
                : "Continue shopping as a guest"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
