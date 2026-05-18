import { Dropdown } from "./Dropdown";
import { TimeOfDay, timeRangeFor } from "@/models/Run";

type TimeOfDayDropdownProps = {
  value: string;
  readonly?: boolean;
  onSelect: (value: string) => void;
  testID?: string;
};

const timesOfDayOptions = Object.entries(TimeOfDay).map(([key, value]) => ({
  label: value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() + ' ' + timeRangeFor(value),
  value: value
}));

export const TimeOfDayDropdown: React.FC<TimeOfDayDropdownProps> = ({ value, readonly=false, onSelect, testID="timeOfDay" }) => {

  return (
    <Dropdown
      value={value}
      disabled={readonly}
      onSelect={(value) => onSelect(value)}
      options={timesOfDayOptions}
      testID={testID}
      initialLabel="Choose time of day..."
    />
  );
}
