import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './Button.css';

type Variant = 'primary' | 'outline' | 'light' | 'outline-light' | 'quiet';
type Size = 'sm' | 'md' | 'lg';

type CommonProps = {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  className?: string;
  children: ReactNode;
};

type AsLink = CommonProps & { to: string; href?: never };
type AsAnchor = CommonProps & { href: string; to?: never; external?: boolean };
type AsButton = CommonProps & { to?: never; href?: never } & ButtonHTMLAttributes<HTMLButtonElement>;

export type ButtonProps = AsLink | AsAnchor | AsButton;

/** Pill-shaped action used everywhere on the site. Renders a router Link, an anchor or a button. */
export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', block, className, children } = props;
  const cls = ['btn', `btn--${variant}`, `btn--${size}`, block && 'btn--block', className].filter(Boolean).join(' ');

  if ('to' in props && props.to) {
    return (
      <Link to={props.to} className={cls}>
        {children}
      </Link>
    );
  }
  if ('href' in props && props.href) {
    const ext = (props as AsAnchor).external;
    return (
      <a href={props.href} className={cls} {...(ext ? { target: '_blank', rel: 'noreferrer' } : {})}>
        {children}
      </a>
    );
  }
  const { variant: _v, size: _s, block: _b, className: _c, children: _ch, ...rest } = props as AsButton;
  return (
    <button type="button" {...rest} className={cls}>
      {children}
    </button>
  );
}
