
const Image = (props: any) => {
  return (
    <div>
      <img src={props.url} alt={props.alt}  width="80" height="80" border-radius="50%" />
    </div>
  );
};

export default Image;