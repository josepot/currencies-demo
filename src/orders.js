import { bind } from "@react-rxjs/core"
import { combineKeys, createKeyedSignal, createSignal } from "@react-rxjs/utils"
import { combineLatest, concat, defer, EMPTY, merge } from "rxjs"
import { map, pluck, scan, startWith, switchMap } from "rxjs/operators"
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

const [add$, onAdd] = createSignal()
const [orderPrice$, onChangeOrderPrice] = createKeyedSignal(
  (x) => x.id,
  (id, value) => ({ id, value })
)
const [orderCurrency$, onChangeCurrency] = createKeyedSignal(
  (x) => x.id,
  (id, value) => ({ id, value })
)
const [updateCurrencyRate$, onChangeCurrencyRate] = createKeyedSignal(
  (x) => x.id,
  (id, value) => ({ id, value })
)
export { onAdd, onChangeOrderPrice, onChangeCurrency, onChangeCurrencyRate }

const [useCurrencies, currencies$] = bind(
  EMPTY,
  Object.keys(initialCurrencyRates)
)

const [useCurrencyRate, currencyRate$] = bind((id) =>
  updateCurrencyRate$(id).pipe(
    pluck("value"),
    startWith(initialCurrencyRates[id])
  )
)

export { useCurrencies, useCurrencyRate }

const initialIds = Object.keys(initialOrders)
const [useOrderIds, orderIds$] = bind(
  add$.pipe(
    map(uuidv4),
    scan((acc, id) => [...acc, id], initialIds)
  ),
  initialIds
)

const [useOrder, order$] = bind((id) =>
  defer(() => {
    const init = initialOrders[id] || {
      id,
      title: "Item " + Math.round(Math.random() * 1000),
      price: Math.round(Math.random() * 1000),
      currency: "usd"
    }

    const price = concat([init.price], orderPrice$(id).pipe(pluck("value")))
    const currency = concat(
      [init.currency],
      orderCurrency$(id).pipe(pluck("value"))
    )
    const orderPrice = combineLatest([
      currency.pipe(switchMap(currencyRate$)),
      price
    ]).pipe(map(([currencyRate, price]) => price * (1 / currencyRate)))

    return combineLatest({
      price,
      currency,
      orderPrice
    }).pipe(map((update) => ({ ...init, ...update })))
  })
)

export { useOrderIds, useOrder }

const [useOrderTotal, orderTotal$] = bind(
  combineKeys(orderIds$, order$).pipe(
    map((orders) =>
      Array.from(orders.values())
        .map((x) => x.orderPrice)
        .reduce((a, b) => a + b, 0)
    )
  )
)
export { useOrderTotal }

export const source$ = merge(
  orderTotal$,
  combineKeys(currencies$, currencyRate$)
)
