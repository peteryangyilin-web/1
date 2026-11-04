export function passwordIssue(password,confirmation){
 if(typeof password!=='string'||Array.from(password).length<8)return 'Use at least 8 characters for your password.';
 if(new TextEncoder().encode(password).length>72)return 'This password is too long. Please use a shorter password.';
 if(password!==confirmation)return 'The passwords do not match.';
 return '';
}
