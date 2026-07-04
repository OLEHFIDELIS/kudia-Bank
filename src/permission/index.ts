import { AccessControl } from 'accesscontrol';

const Permissions = new AccessControl();

// ADMIN
Permissions.grant('ADMIN').resource('users').createAny().readAny().updateAny().deleteAny();
Permissions.grant('ADMIN').resource('accounts').createAny().readAny().updateAny().deleteAny();
Permissions.grant('ADMIN').resource('transactions').createAny().readAny().updateAny().deleteAny();
Permissions.grant('ADMIN').resource('loans').createAny().readAny().updateAny().deleteAny();

// EDITOR
Permissions.grant('EDITOR').resource('users').createOwn().readAny().updateAny().deleteOwn();
Permissions.grant('EDITOR').resource('accounts').createOwn().readAny().updateAny().deleteOwn();
Permissions.grant('EDITOR').resource('transactions').createOwn().readAny().updateAny().deleteOwn();

// CUSTOMER
Permissions.grant('CUSTOMER').resource('users').createOwn().readOwn().updateOwn().deleteOwn();
Permissions.grant('CUSTOMER').resource('accounts').createOwn().readOwn().updateOwn().deleteOwn();
Permissions.grant('CUSTOMER').resource('transactions').createOwn().readOwn().updateOwn().deleteOwn();

export default Permissions;