import { WebDateTimePicker } from './WebDateTimePicker';

export enum TimeIncrements {
  ONE_MINUTE = 1,
  FIVE_MINUTES = 5,
  TEN_MINUTES = 10,
  FIFTEEN_MINUTES = 15,
}

export type DateTimeInputProps = {
  value: Date;
  disabled?: boolean;
  readOnly?: boolean;
  onSelect: (newVal: Date) => void;
  minDate?: Date;
  testID?: string;
  holdOpen?: boolean;
  timePicker?: boolean;
  timeIncrements?: TimeIncrements;
  initialLabel?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

export const DateTimeInput: React.FC<DateTimeInputProps> = ({
  value,
  disabled=false,
  readOnly=false,
  onSelect,
  minDate,
  holdOpen=false,
  timePicker=false,
  timeIncrements=TimeIncrements.ONE_MINUTE,
  testID="dateInput",
  accessibilityLabel="Due Date",
  accessibilityHint="Select the due date"
}) => {

  return (
    <WebDateTimePicker
      value={value}
      onSelect={onSelect}
      disabled={disabled || readOnly}
      minDate={minDate}
      holdOpen={holdOpen}
      timePicker={timePicker}
      timeIncrements={timeIncrements}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    />
  );

};
