import { useEffect, useState } from 'react';
import DateTimePicker, { DateType, useDefaultStyles } from 'react-native-ui-datepicker';
import { Input, InputField, InputIcon, InputSlot } from '../ui/input';
import { HStack } from '../ui/hstack';
import { VStack } from '../ui/vstack';
import { Text } from '../ui/text';
import { devLog, isMobileSize } from '@/common/utils';
import { TimeIncrements } from './DateTimeInput';
import { CalendarDaysIcon } from '../ui/icon';

type DateTimeInputProps = {
  value: Date;
  disabled?: boolean;
  readOnly?: boolean;
  onSelect: (value: Date) => void;
  minDate?: Date;
  holdOpen?: boolean;
  timePicker?: boolean;
  timeIncrements?: TimeIncrements;
  testID?: string;
  initialLabel?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

export const WebDateTimePicker: React.FC<DateTimeInputProps> = ({
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

  const [openPicker, setOpenPicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(value);
  const [dateString, setDateString] = useState('');
  const [timeString, setTimeString] = useState(formatTimeInput(value));
  const [invalidTime, setInvalidTime] = useState('');

  const finallySetDate = (aDate: Date) => {
    const formattedTime = formatTimeInput(aDate);
    devLog('Finally setting date: ', aDate);
    devLog('Finally setting formattedTime: ', formattedTime);
    onSelect(aDate);
    setDateString(aDate.toLocaleDateString());
    setTimeString(formattedTime);
    setInvalidTime('');
    setOpenPicker(holdOpen);
  }

  const handleDatePickerChange = (selected: DateType) => {
    devLog('Date Picker Selected: ', selected);
    if (selected && selected instanceof Date) {
      setPickerDate(selected);
      setDateString(selected.toLocaleDateString());
      // devLog('From value: ', value);
      onSelect(selected);
      setOpenPicker(holdOpen);
      // devLog('Selected date: ', selected.toLocaleDateString());
      // validateAndSetTime(selected);
    } else {
      console.log('Invalid date selected');
      setInvalidTime('Invalid date selected.');
    }
  };

  const validateAndSetCurrentTime = () => {
    validateAndSetTime(value);
  }

  const validateAndSetTime = (onDate: Date) => {
    devLog('Validating and setting time: ', onDate);
    devLog('timeString: ', timeString);
    const timeRegex = /(\d{1,2}):(\d{2})\s*(am|pm)?/i;
    const match = timeString.match(timeRegex);

    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const ampm = match[3] ? match[3].toLowerCase() : undefined;

      devLog('Parsed hours: ', hours);
      devLog('Parsed minutes: ', minutes);
      devLog('Parsed ampm: ', ampm);

      if (ampm === 'pm' && hours < 12) {
        hours += 12;
      } else if (ampm === 'am' && hours === 12) { // Midnight case
        hours = 0;
      }

      if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        const remainder = minutes % timeIncrements;
        onDate.setHours(hours, minutes-remainder);
        finallySetDate(onDate);
        console.log('Selected date: ', onDate.toLocaleString());
      } else {
        setInvalidTime('Invalid time format. Please enter in HH:MM AM/PM format.');
      }
    } else {
      setInvalidTime('Invalid time format. Please enter in HH:MM AM/PM format.');
    }
  }

  const validateDateString = () => {
    if (openPicker) return;
    if (dateString.length === 0) {
      setDateString(value.toLocaleDateString());
      return;
    }
    try {
      const parsedDate = new Date(dateString);
      if (isNaN(parsedDate.getTime())) {
        setInvalidTime('Invalid date format. Please enter in MM/DD/YYYY format.');
        return;
      }
      const updatedDate = new Date(
        parsedDate.getFullYear(),
        parsedDate.getMonth(),
        parsedDate.getDate(),
        value.getHours(),
        value.getMinutes());
      if (minDate && updatedDate.getTime() < minDate.getTime()) {
        setInvalidTime('Due date must be after the min date: ' + minDate);
      } else {
        setInvalidTime('');
        finallySetDate(updatedDate);
      }
    } catch (error) {
      console.error('Invalid date string: ', dateString);
      setInvalidTime('Invalid date format. Please enter in MM/DD/YYYY format.');
    }
  };

  const updateDateString = (newDateString: string) => {
    devLog('Updating date string: ', newDateString);
    setDateString(newDateString);
  }

  useEffect(() => {
    setOpenPicker(openPicker && !readOnly);
  }, [readOnly]);

  useEffect(() => {
    // const formattedTime = formatTimeInput(value);
    // devLog('useEffect formattedTime: ', formattedTime);
    setDateString(value.toLocaleDateString());
    // setTimeString(formattedTime);
    setPickerDate(value);
  }, [value]);

  const defaultStyles = useDefaultStyles();

  return (
    <VStack className="w-full ">
      <HStack className="w-full">
        <Input
            variant="outline"
            size="md"
            isDisabled={disabled}
            isReadOnly={readOnly || openPicker}
            isInvalid={false}
            className="flex-1"
          >
            {isMobileSize() && (
              <InputSlot onPress={() => setOpenPicker(!openPicker)} className="pr-3">
                <InputIcon as={CalendarDaysIcon} />
              </InputSlot>
            )}
            <InputField
              autoComplete="off"
              onPress={() => setOpenPicker(true)}
              value={dateString}
              readOnly={readOnly || openPicker}
              // onFocus={() => setOpenPicker(true)}
              onChangeText={ updateDateString }
              onBlur={validateDateString}
              placeholder={"Input date here..."}
              testID={testID}
              inputMode="text"
              accessibilityLabel={accessibilityLabel}
              accessibilityHint={accessibilityHint}/>
            {!isMobileSize() && (
              <InputSlot onPress={() => setOpenPicker(!openPicker)} className="pr-3">
                <InputIcon as={CalendarDaysIcon} />
              </InputSlot>
            )}
        </Input>
        {timePicker && (<Input
            variant="outline"
            size="md"
            isDisabled={disabled}
            isInvalid={false}
            className="flex-1"
          >
            <InputField
              autoComplete="off"
              value={timeString}
              readOnly={readOnly}
              onFocus={() => setOpenPicker(true)}
              onChangeText={ setTimeString }
              // onBlur={validateAndSetCurrentTime}
              placeholder={"Input time here..."}
              testID={testID}
              inputMode="text"
              accessibilityLabel={accessibilityLabel + " Time"}
              accessibilityHint={accessibilityHint + " Time"}/>
          </Input>
        )}
      </HStack>
      {invalidTime.length > 0 && <Text className="text-sm text-error-900">{invalidTime}</Text>}
      {(holdOpen || openPicker) ? (
        <DateTimePicker
        mode="single"
        timePicker={timePicker}
        date={pickerDate}
        minDate={minDate}
        // use12Hours={true}
        onChange={({ date }) =>  handleDatePickerChange(date)}
        styles={defaultStyles}
      />
      ) : null}
    </VStack>
  )
};

const formatTimeInput = (date: Date) => {
  let hourString = date.getHours().toString();
  let ampm = 'AM';
  const hours = date.getHours();
  if (hours == 0) {
    hourString = '12';
  } else if (hours == 12) {
    ampm = 'PM';
  } else if (hours > 12) {
    ampm = 'PM';
    hourString = (hours - 12).toString();
  }
  const minutes = date.getMinutes().toString();
  return `${hourString.padStart(2, '0')}:${minutes.padStart(2, '0')} ${ampm}`;
}
