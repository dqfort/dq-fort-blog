---
title: Combine MUI and React hook form
author: Eric Cheung
pubDatetime: 2024-04-18T04:17:50Z
slug: combine-mui-and-react-hook-form
featured: false
draft: false
tags:
  - React
description:
  Make React hook form using MUI components
---

[MUI](https://mui.com/) is a rich UI tool kit that provides a lot of components based on [Material Design](https://m3.material.io/). However, handling forms data is out of its scope, but there is [React Hook Form](https://react-hook-form.com/) for it. So could we combine those features? Yes, we can inherit MUI components for it.

For example, we can create a TextField component like:
```typescript
import MuiTextField, { TextFieldProps } from "@mui/material/TextField";
import { Control, Controller } from "react-hook-form";


type CustomTextFieldProps = {
  name: string;
  control: Control<any>;
} & TextFieldProps

function TextField ({
  name,
  control,
  ...props
}: CustomTextFieldProps) {
  return (
    <Controller
      render={({ field, fieldState }) => 
        <MuiTextField 
          onChange = {field.onChange} // send value to hook form
          onBlur = {field.onBlur} // notify when input is touched/blur
          value = {field.value} // input value
          name = {field.name} // set the input name
          inputRef = {field.ref} // pass the input ref to the mui text field, so we can focus on the input when error appear
          {
            ...(
              fieldState.error && {
                error: true,
                helperText: fieldState.error.message
              }
            )
          }
          {...props}
        />
      }
      name={name}
      rules={
        {...(props.required && {required: 'This field is required'})}
      }
      control={control}
      defaultValue=""
    />
  );
}

export default TextField;
```

It seems complicated, but it's not. The main element is the `control` from React hook form, which is used for handling things such as form processing data, and validation. Then we bind the MUI Textfield and the `control` by using the `Controller` component from React hook form. Now we can tell the control what to render, in this example we are using MUI TextField. Then set the `value` from the control's field to render that in the TextField, and bind the events like `onChange`, `onBlur` so that the form control can know the actions in the text field and do some validations. `InputRef` is used to set focus if getting any errors.

Here is a more complicated [demo](https://stackblitz.com/edit/vitejs-vite-94epy9?file=src%2FApp.tsx) to show how it works, it might need a longer time to load.