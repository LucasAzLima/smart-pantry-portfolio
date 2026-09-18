import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Input } from "./Input";

const meta = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
  args: {
    placeholder: "e.g. Olive oil",
    onChange: fn(),
  },
  argTypes: {
    type: {
      control: "select",
      options: ["text", "number", "email", "search", "date"],
    },
    disabled: {
      control: "boolean",
    },
    error: {
      control: "text",
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Number: Story = {
  args: {
    type: "number",
    placeholder: "0",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: "Cannot edit",
  },
};

export const WithError: Story = {
  args: {
    error: "Name is required",
    defaultValue: "",
  },
};

export const Date: Story = {
  args: {
    type: "date",
    defaultValue: "2026-09-25",
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-4">
      <Input placeholder="Default" />
      <Input type="number" placeholder="Quantity" />
      <Input type="date" defaultValue="2026-09-25" />
      <Input disabled defaultValue="Disabled" />
      <Input error="Enter a valid name" defaultValue="!" />
    </div>
  ),
};
