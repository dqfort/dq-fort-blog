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

[MUI](https://mui.com/) provides is a rich UI tool kit provides a lot components based on [Material Design](https://m3.material.io/). However, handling forms data is out of its scope, but there is [React Hook Form](https://react-hook-form.com/) for it. So could we combine those feature together? Yes, we can inherit MUI components for it.

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
          name = {field.name} // send down the input name
          inputRef = {field.ref} // send input ref, so we can focus on input when error appear
          {
            ...(fieldState.error && {
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
