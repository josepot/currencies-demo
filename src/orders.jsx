import React from "react"
import { bind, Subscribe } from "@react-rxjs/core"
import { combineKeys, createKeyedSignal, createSignal } from "@react-rxjs/utils"
import { combineLatest, concat, defer, EMPTY, pipe } from "rxjs"
import { map, pluck, scan, switchMap } from "rxjs/operators"
import { uuidv4 } from "./utils"

const initialCurrencyRates = {
  eur: 1.12,
  usd: 1.33,
  rup: 97.45,
  aus: 1.75,
  can: 1.75
}

const initialOrders = Object.fromEntries(
  [
    {
      id: uuidv4(),
      title: "The LEGO Movie 2: The Second Part",
      price: 8,
      currency: "usd"
    },
    {
      id: uuidv4(),
      title: "Kangaroo, 2yo 🦘",
      price: 750,
      currency: "aus"
    },
    {
      id: uuidv4(),
      title: "Old Amsterdam 🧀",
      price: 12.99,
      currency: "eur"
    },
    {
      id: uuidv4(),
      title: "Old Football boots Virgil van Dijk",
      price: 1200,
      currency: "eur"
    }
  ].map((order) => [order.id, order])
)

// Currencies
const [useCurrencies] = bind(EMPTY, Object.keys(initialCurrencyRates))

const [rateChange$, onRateChange] = createKeyedSignal()
const [useCurrencyRate, currencyRate$] = bind(
  rateChange$,
  (id) => initialCurrencyRates[id]
)
export { useCurrencies, onRateChange, useCurrencyRate }

// Orders
const [addOrder$, onAddOrder] = createSignal()

const initialOrderIds = Object.keys(initialOrders)
const [useOrderIds, orderIds$] = bind(
  addOrder$.pipe(
    map(uuidv4),
    scan((acc, id) => [...acc, id], initialOrderIds)
  ),
  initialOrderIds
)

const [priceChange$, onPriceChange] = createKeyedSignal()
const [currencyChange$, onCurrencyChange] = createKeyedSignal()

const [useOrder, order$] = bind((id) =>
  defer(() => {
    const initialOrder = initialOrders[id] || {
      id,
      title: "Item " + Math.round(Math.random() * 1000),
      price: Math.round(Math.random() * 1000),
      currency: "usd"
    }

    const price$ = concat([initialOrder.price], priceChange$(id))
    const currency$ = concat([initialOrder.currency], currencyChange$(id))

    const rate$ = currency$.pipe(switchMap((x) => currencyRate$(x)))
    const orderPrice$ = combineLatest([rate$, price$]).pipe(
      map(([currencyRate, price]) => price * (1 / currencyRate))
    )

    return combineLatest({
      price: price$,
      currency: currency$,
      orderPrice: orderPrice$
    }).pipe(map((update) => ({ ...initialOrder, ...update })))
  })
)
export { useOrderIds, onAddOrder, useOrder, onPriceChange, onCurrencyChange }

// Total
const [useOrderTotal, orderTotal$] = bind(
  combineKeys(orderIds$, pipe(order$, pluck("orderPrice"))).pipe(
    map((orderPrices) => [...orderPrices.values()].reduce((a, b) => a + b, 0))
  )
)
export { useOrderTotal }

// Provider
export const Provider = ({ children }) => (
  <Subscribe source$={orderTotal$}>{children}</Subscribe>
)
