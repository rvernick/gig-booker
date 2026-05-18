import { Dropdown } from "./Dropdown";

type BooleanDropdownProps = {
  value: boolean;
  readonly: boolean;
  onSelect: (value: boolean) => void;
  testID?: string;
};

export const BooleanDropdown: React.FC<BooleanDropdownProps> = ({ value, readonly, onSelect, testID="boolean" }) => {
  const yesno = ['Yes', 'No'];
  const options = yesno?.map(val => ({ label: val, value: val }));

  return (
    <Dropdown
      value={value ? 'Yes' : 'No'}
      disabled={readonly}
      onSelect={(value) => onSelect(value == 'Yes')}
      options={options}
      testID={testID}
      initialLabel="Yes/No..."
    />
  );
}
