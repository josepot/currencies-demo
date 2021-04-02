import React, { memo } from "react"
import { render } from "react-dom"
import "./styles.css"
import { Table, formatPrice, formatCurrency, NumberInput } from "./utils"
import {
  useCurrencies,
  onRateChange,
  useCurrencyRate,
  onAddOrder,
  useOrderIds,
  onPriceChange,
  onCurrencyChange,
  useOrder,
  useOrderTotal,
  Provider
} from "./orders"

function CurrencySelector({ value, onChange }) {
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

const Orderline = memo(({ id }) => {
  const order = useOrder(id)
  return (
    <tr>
      <td>{order.title}</td>
      <td>
        <NumberInput
          value={order.price}
          onChange={(value) => {
            onPriceChange(order.id, value)
          }}
        />
      </td>
      <td>
        <CurrencySelector
          value={order.currency}
          onChange={(e) => {
            onCurrencyChange(order.id, e.target.value)
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

const CurrencyRate = ({ currency }) => {
  const rate = useCurrencyRate(currency)
  return (
    <tr key={currency}>
      <td>{formatCurrency(currency)}</td>
      <td>
        <NumberInput
          value={rate}
          onChange={(value) => {
            onRateChange(currency, value)
          }}
        />
      </td>
    </tr>
  )
}

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

const OrderTotal = () => {
  const total = useOrderTotal()
  return <div className="total">{formatPrice(total)} £</div>
}

const App = () => (
  <Provider>
    <div className="App">
      <h1>Orders</h1>
      <Orders />
      <div className="actions">
        <button onClick={onAddOrder}>Add</button>
        <OrderTotal />
      </div>
      <h1>Exchange rates</h1>
      <Currencies />
    </div>
  </Provider>
)

const rootElement = document.getElementById("app")
render(<App />, rootElement)
