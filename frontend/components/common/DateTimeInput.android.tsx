import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { devLog } from "@/common/utils";
import { DateTimeInputProps } from './DateTimeInput';
import { VStack } from '../ui/vstack';

export const DateTimeInput: React.FC<DateTimeInputProps> = ({
  value,
  disabled=false,
  readOnly=false,
  onSelect,
  minDate,
  holdOpen=false,
  timePicker=false,
  testID="dateInput",
  accessibilityLabel="Due Date",
  accessibilityHint="Select the due date"
}) => {

  const pickerSelect = (event: DateTimePickerEvent, date?: Date | undefined): void => {
    devLog('A date has been picked: ', date);
    onSelect(date?? value);
  }

  return (
    <VStack style={{flexDirection: 'row', alignItems: 'center'}}>
      <DateTimePicker
        className='justify-start'
        style={{ justifyContent: 'flex-start' }}
        mode='date'
        value={value}
        minimumDate={minDate}
        disabled={disabled || readOnly}
        onChange={pickerSelect}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      />
      {timePicker && (
        <DateTimePicker
          className='justify-start'
          style={{ justifyContent: 'flex-start' }}
          mode='time'
          value={value}
          minuteInterval={5}
          minimumDate={minDate}
          disabled={disabled || readOnly}
          onChange={pickerSelect}
          testID={testID}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
        />
      )}
    </VStack>
  );
};
