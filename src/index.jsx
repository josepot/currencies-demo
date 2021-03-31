import * as React from "react"
import { memo } from "react"
import { render } from "react-dom"
import {
  onAdd,
  onChangeOrderPrice,
  onChangeCurrency,
  onChangeCurrencyRate,
  useCurrencies,
  useCurrencyRate,
  useOrderIds,
  useOrder,
  useOrderTotal,
  source$
} from "./orders"
import { Table, formatPrice, formatCurrency, NumberInput } from "./utils"

import "./styles.css"
import { Subscribe } from "@react-rxjs/core"

const Orderline = memo(({ id }) => {
  const order = useOrder(id)
  return (
    <tr>
      <td>{order.title}</td>
      <td>
        <NumberInput
          value={order.price}
          onChange={(value) => {
            onChangeOrderPrice(order.id, value)
          }}
        />
      </td>
      <td>
        <Currency
          value={order.currency}
          onChange={(e) => {
            onChangeCurrency(order.id, e.target.value)
          }}
        />
      </td>
      <td>{formatPrice(order.orderPrice)} £</td>
    </tr>
  )
})

const Orders = () => {
  const orderIds = useOrderIds()
  return (
    <Table columns={["Article", "Price", "Currency", "Price"]}>
      {orderIds.map((id) => (
        <Orderline key={id} id={id} />
      ))}
    </Table>
  )
}

const CurrencyRate = memo(({ currency }) => {
  const rate = useCurrencyRate(currency)
  return (
    <tr key={currency}>
      <td>{formatCurrency(currency)}</td>
      <td>
        <NumberInput
          value={rate}
          onChange={(value) => {
            onChangeCurrencyRate(currency, value)
          }}
        />
      </td>
    </tr>
  )
})

const Currencies = () => {
  const currencies = useCurrencies()
  return (
    <Table columns={["Currency", "Exchange rate"]}>
      {currencies.map((currency) => (
        <CurrencyRate key={currency} currency={currency} />
      ))}
    </Table>
  )
}

export function Currency({ value, onChange }) {
  const currencies = useCurrencies()
  return (
    <select onChange={onChange} value={value}>
      {currencies.map((c) => (
        <option key={c} value={c}>
          {formatCurrency(c)}
        </option>
      ))}
    </select>
  )
}

const OrderTotal = () => {
  const total = useOrderTotal()
  return <div className="total">{formatPrice(total)} £</div>
}

const App = () => (
  <Subscribe source$={source$}>
    <div className="App">
      <h1>Orders</h1>
      <Orders />
      <div className="actions">
        <button onClick={onAdd}>Add</button>
        <OrderTotal />
      </div>
      <h1>Exchange rates</h1>
      <Currencies />
    </div>
  </Subscribe>
)

const rootElement = document.getElementById("app")
render(<App />, rootElement)
