import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

// Required npm packages for validation: 'class-validator' & 'class-transformer'
// Put this line 'app.useGlobalPipes(new ValidationPipe({whiteList: true}))' in main.ts to make validation work
//The 'whiteList' option is used to only register fields that have been exolicitly specified in the dtos.

export class SignUpDto {
  id: number;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;
}

export class LoginDto {
  id: number;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}
