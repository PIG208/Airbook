import { InfoCircleFill } from "react-bootstrap-icons";

export default function NothingHere(props: { control?: boolean }) {
  if (!(props.control ?? true)) return <div></div>;
  return (
    <div className="nothing-here">
      <InfoCircleFill /> Nothing to show here.
    </div>
  );
}
