# Interfaces

Interfaces are namespaced for the sake of convenience as well as (hopefully) clarity as to how the data is interralated. This means that in order to access interfaces across the application, you should attempt to automatically import their highest-level namespace.

```ts
// Wrong
import { IUser } from '../interfaces/Users';
const user: IUser;

// Right
import { Users } from '../interfaces';
const user: Users.IUser;
```

Enums are special in that they ARE namespaced, but only at their lowest-level

```ts
// Wrong
import Enum from '../interfaces/';
const role = Enum.Roles.RolesEnum.teacher;

// Also wrong
import { RolesEnum } from '../interfaces/Enum/roles';
const role = RolesEnum.teacher;

// Right
import { Roles } from '../interfaces';
const role = Roles.RolesEnum.teacher;
```

When in doubt, just make sure that if you're in need of an interface, you're importing a namespace from `interfaces`.
