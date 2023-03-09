import { cleanup, render } from '@testing-library/react'
import React from 'react'
import { afterEach, expect, test } from 'vitest'

import App from '@/App'

const TestApp: React.FC = () => <App />

afterEach(() => {
  cleanup()
})

// options: 'node' | 'jsdom' | 'happy-dom' | 'edge-runtime' | string ; default=jsdom
// @vitest-environment jsdom
test('App mounts properly', () => {
  const wrapper = render(<TestApp />)
  expect(wrapper).toBeTruthy()
})
