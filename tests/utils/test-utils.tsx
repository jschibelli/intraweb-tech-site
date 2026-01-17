import { ReactElement, ReactNode } from 'react'
import { render, RenderOptions } from '@testing-library/react'

// Add custom render method that wraps components with providers if needed
// Currently no providers, but this structure allows easy addition later

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    // Add any custom options here
}

function customRender(
    ui: ReactElement,
    options?: CustomRenderOptions,
) {
    // If you need to wrap with providers in the future, do it here
    // const Wrapper = ({ children }: { children: ReactNode }) => (
    //   <SomeProvider>
    //     {children}
    //   </SomeProvider>
    // )

    return render(ui, { ...options })
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }
