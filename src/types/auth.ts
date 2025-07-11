export interface RegisterDto {
  fullname: string;
  username: string;
  email: string;
  number: string;
  password: string;
  roles?: string[];
}
