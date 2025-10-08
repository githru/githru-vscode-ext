import { IconButton, IconButtonProps } from "@mui/material";
import FiberNewIcon from "@mui/icons-material/FiberNew";

type NewButtonProps = {} & IconButtonProps;

const NewButton = (props: NewButtonProps) => {
  return (
    <IconButton {...props}>
      <FiberNewIcon />
    </IconButton>
  );
};

export default NewButton;
