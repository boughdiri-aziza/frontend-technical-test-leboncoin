import { render } from "@testing-library/react"
import { useRouter } from "next/router"
import App from "../pages"

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}))

describe("App", () => {
  it("should redirect to /messages", () => {
    const replace = jest.fn()
    ;(useRouter as jest.Mock).mockReturnValue({ replace })

    render(<App />)

    expect(replace).toHaveBeenCalledWith("/messages")
  })
})