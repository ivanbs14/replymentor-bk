import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AuthDto } from './auth.dto';

describe('AuthDto', () => {
  it('normalizes email without transforming password', async () => {
    const dto = plainToInstance(AuthDto, {
      email: '  USER@Example.COM ',
      password: '  secret123  ',
    });
    expect(await validate(dto)).toEqual([]);
    expect(dto.email).toBe('user@example.com');
    expect(dto.password).toBe('  secret123  ');
  });

  it.each([
    [{}, ['isEmail', 'isLength', 'isString']],
    [{ email: 'invalid', password: 'short' }, ['isEmail', 'isLength']],
    [{ email: 'a@b.com', password: 'x'.repeat(129) }, ['isLength']],
  ])('rejects invalid auth input %#', async (input, expectedRules) => {
    const errors = await validate(plainToInstance(AuthDto, input));
    const rules = errors.flatMap((error) =>
      Object.keys(error.constraints ?? {}),
    );
    for (const rule of expectedRules) expect(rules).toContain(rule);
  });
});
