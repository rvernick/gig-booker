export class LoginUserDto {
  username: string;
  password: string;
}

export class GoogleLoginResponse {
  id: string;
  name: string;
  email: string;
  photo: string | null;
  family_name: string;
  given_name: string;
  scopes: string[];
  id_token: string;
  type: string;
}
