import './index.css'
import stylesText from './styles.css?raw'
import { useEffect } from 'react'

export function ForceStyles() {
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = stylesText
    document.head.appendChild(style)
    return () => style.remove()
  }, [])
  return null
}
