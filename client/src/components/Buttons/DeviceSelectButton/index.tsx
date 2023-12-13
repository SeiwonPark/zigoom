import { useEffect, useState } from 'react'

import Select, { OptionProps, SingleValueProps, StylesConfig, components } from 'react-select'

import { MediaTypes, SVGProps } from '@/typings/types'

import styles from './index.module.css'

interface DeviceOption {
  value: string
  label: string
  Icon: string | SVGProps
}

interface DeviceSelectButtonProps {
  Icon: string | SVGProps
  options: MediaDeviceInfo[]
}

interface DeviceSelectButtonProps {
  Icon: string | SVGProps
  options: MediaDeviceInfo[]
  deviceType: MediaTypes
  onDeviceChange: (deviceId: string, deviceType: MediaTypes) => void
}

const CustomSingleValue = ({ children, ...props }: SingleValueProps<DeviceOption>) => (
  <components.SingleValue {...props}>
    <div className={styles.singleValueIcon}>
      <props.data.Icon fill="#5f6368" width={24} height={24} />
    </div>
    <div className={styles.singleValueContents}>{children}</div>
  </components.SingleValue>
)

const CustomOption = (props: OptionProps<DeviceOption>) => (
  <components.Option {...props}>{props.data.label}</components.Option>
)

export const DeviceSelectButton = ({ Icon, options, deviceType, onDeviceChange }: DeviceSelectButtonProps) => {
  const selectOptions = options.map((option) => ({
    value: option.deviceId,
    label: option.label,
    Icon,
  }))
  const [selectedOption, setSelectedOption] = useState<DeviceOption | null>(selectOptions[0] || null)

  useEffect(() => {
    setSelectedOption(selectOptions[0] || null)
  }, [options])

  const customStyles: StylesConfig<DeviceOption> = {
    /**
     * Default dropdown option.
     * @see CustomSingleValue for inner details.
     */
    singleValue: (styles) => ({
      ...styles,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: '4px',
      cursor: 'pointer',
    }),
    /**
     * Each option in the dropdown list
     * @see CustomOption for inner details.
     */
    option: (styles) => ({
      ...styles,
      cursor: 'pointer',
    }),
    /**
     * Separator between default single value and dropdown arrow icon.
     */
    indicatorSeparator: (styles) => ({
      ...styles,
      display: 'none',
      cursor: 'pointer',
    }),
    /**
     * This is the wrapper style for each select dropdown.
     */
    control: (styles) => ({
      ...styles,
      border: '2px solid transparent',
      borderRadius: '20px',
      cursor: 'pointer',
      width: '200px',
      margin: '10px',

      ':focus': {
        ...styles[':focus'],
        border: '2px solid transparent',
      },
      ':active:': {
        ...styles[':active'],
        border: '2px solid transparent',
      },
      ':hover': {
        ...styles[':hover'],
        border: '2px solid transparent',
      },
    }),
  }

  // FIXME: what type??
  const handleDeviceChange = (changedOption: any) => {
    onDeviceChange(changedOption.value, deviceType)
    setSelectedOption(changedOption)
  }

  if (selectOptions.length === 0) {
    return null
  }

  return (
    <Select
      styles={customStyles}
      options={selectOptions}
      value={selectedOption}
      onChange={handleDeviceChange}
      components={{
        SingleValue: CustomSingleValue,
        Option: CustomOption,
      }}
    />
  )
}
