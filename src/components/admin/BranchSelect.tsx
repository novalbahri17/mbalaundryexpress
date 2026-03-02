import { Select } from "antd";
import { useBranches } from "@/hooks/useBranches";

type BranchSelectProps = {
	value?: string;
	onChange?: (value: string) => void;
	allowAll?: boolean;
	placeholder?: string;
};

export function BranchSelect({ value, onChange, allowAll = true, placeholder }: BranchSelectProps) {
	const { data: branches = [], isLoading } = useBranches({ activeOnly: false });
	return (
		<Select
			showSearch
			value={value}
			onChange={onChange}
			loading={isLoading}
			placeholder={placeholder ?? "Pilih cabang"}
			options={[
				...(allowAll ? [{ value: "", label: "Semua Cabang" }] : []),
				...branches.map((branch) => ({ value: branch.id, label: branch.name })),
			]}
			filterOption={(input, option) => (option?.label?.toString().toLowerCase() ?? "").includes(input.toLowerCase())}
		/>
	);
}

