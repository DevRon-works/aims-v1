import { ChevronDown } from '../../lib/icons'
import { useMemo, useRef, useState } from 'react'
import { Input } from '../../components/ui/input'

type EmailComboboxProps = {
  label: string
  placeholder: string
  value?: string
  options: string[]
  error?: string
  onChange: (value: string) => void
}

function EmailCombobox({
  label,
  placeholder,
  value = '',
  options,
  error,
  onChange,
}: EmailComboboxProps) {
  const [open, setOpen] = useState(false)
  const blurTimer = useRef<number | null>(null)
  const filteredOptions = useMemo(() => {
    const query = value.trim().toLowerCase()

    return options.filter((option) => !query || option.toLowerCase().includes(query))
  }, [options, value])

  function scheduleClose() {
    blurTimer.current = window.setTimeout(() => setOpen(false), 120)
  }

  function cancelClose() {
    if (blurTimer.current) {
      window.clearTimeout(blurTimer.current)
      blurTimer.current = null
    }
  }

  return (
    <label className="field-group email-combobox-field">
      <span className="label">{label}</span>
      <div className="email-combobox">
        <Input
          aria-autocomplete="list"
          aria-expanded={open}
          aria-invalid={Boolean(error)}
          placeholder={placeholder}
          role="combobox"
          type="text"
          value={value}
          onBlur={scheduleClose}
          onChange={(event) => {
            onChange(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
        />
        <button
          aria-label={`Show ${label.toLowerCase()} suggestions`}
          className="email-combobox-trigger"
          type="button"
          onBlur={scheduleClose}
          onClick={() => setOpen((current) => !current)}
        >
          <ChevronDown aria-hidden="true" size={15} />
        </button>
        {open ? (
          <div className="email-combobox-menu" onMouseDown={cancelClose}>
            {filteredOptions.map((option) => (
              <button
                className="email-combobox-option"
                key={option}
                type="button"
                onClick={() => {
                  onChange(option)
                  setOpen(false)
                }}
              >
                {option}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  )
}

export { EmailCombobox }
