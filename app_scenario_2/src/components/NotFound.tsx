import * as React from "react";

interface INotFoundProps {
  pr: string;
}

interface INotFoundState {
    name: string;
}

export default class NotFound extends React.Component<INotFoundProps, INotFoundState> {
  constructor(props) {
    super(props);
    this.state = {
        name: "",
    };
  }

  public render() {
    return (
        <h2>Ресурс не найден</h2>
    );
  }
}
