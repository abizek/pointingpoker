import clsx from "clsx";
import { isEmpty, isEqual, uniq } from "lodash-es";
import { forwardRef, useState } from "react";
import styled from "styled-components";
import { createVoteOptions } from "../utils/api.js";
import { getStore } from "../hooks/store.js";
import { Button } from "./button.jsx";

const ButtonContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 48px;
	justify-content: space-between;
	padding-top: 10px;
`;

function parseInput(input) {
	return input
		.split(",")
		.map((option) => option.trim())
		.filter(Boolean)
		.map(Number);
}

function validateVoteOptions(voteOptions) {
	const { voteOptions: storedVoteOptionsList } = getStore();

	return (
		!isEmpty(voteOptions) &&
		voteOptions.length > 1 &&
		voteOptions.every((option) => Number.isFinite(option)) &&
		voteOptions.length === uniq(voteOptions).length &&
		!storedVoteOptionsList.some((storedVoteOptions) =>
			isEqual(storedVoteOptions, voteOptions)
		)
	);
}

export const CustomVoteOptionsDialog = forwardRef(function (props, ref) {
	const [input, setInput] = useState("");
	const [formError, setFormError] = useState(true);

	const handleSubmit = async (event) => {
		event.preventDefault();
		if (formError) return;

		await createVoteOptions(parseInput(input));
		setInput("");
		ref.current.close();
	};

	return (
		<dialog ref={ref} className="nes-dialog">
			<form method="dialog" onSubmit={handleSubmit}>
				<p className="title">Create new vote options</p>
				<input
					autoFocus
					placeholder="1, 2, 3, 4..."
					className={clsx("nes-input", {
						"is-error": formError,
					})}
					value={input}
					onChange={(event) => {
						setInput(event.target.value);
						setFormError(
							!validateVoteOptions(parseInput(event.target.value.trim()))
						);
					}}
				/>
				<ButtonContainer>
					<Button
						onClick={() => {
							ref.current.close();
						}}
					>
						Cancel
					</Button>
					<Button submit className="is-primary">
						Create
					</Button>
				</ButtonContainer>
			</form>
		</dialog>
	);
});
