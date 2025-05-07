export class ValidateUserCommand {
  constructor(
    public readonly email: string,
    public readonly plainPassword: string,
  ) {}
}
