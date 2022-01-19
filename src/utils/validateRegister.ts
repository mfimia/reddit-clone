import { UsernamePasswordInput } from "src/resolvers/UsernamePasswordInput";

export const validateRegister = (options: UsernamePasswordInput) => {
  // validation statements
  // if any of these is true, user can't register and will receive error message

  // basic username validation
  if (options.username.length <= 2) {
    return [
      {
        field: "username",
        message: "length must be greater than 2",
      },
    ];
  }

  // basic username validation
  if (options.username.includes("@")) {
    return [
      {
        field: "username",
        message: "username cannot include '@'",
      },
    ];
  }

  // basic email validation
  if (!options.email.includes("@")) {
    return [
      {
        field: "email",
        message: "invalid email",
      },
    ];
  }

  // basic password validation
  if (options.password.length <= 3) {
    return [
      {
        field: "password",
        message: "length must be greater than 3",
      },
    ];
  }

  // return null if no errors found
  return null;
};
