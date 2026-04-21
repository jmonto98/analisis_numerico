%Bisección: se ingresa la función f, el intervalo (xi, xs), la tolerancia (Tol) y el máximo de iteraciones (niter)
function [s, E, fm] = Biseccion(f, xi, xs, Tol, niter)
    syms x
    df = diff(f);
    fi = double(subs(f, x, xi));
    fs = double(subs(f, x, xs));

    if fi == 0
        s = xi;
        E = 0;
        fprintf('%f es raiz de f(x)\n', xi)
    elseif fs == 0
        s = xs;
        E = 0;
        fprintf('%f es raiz de f(x)\n', xs)
    elseif fs * fi < 0
        c = 0;
        xm = (xi + xs) / 2;
        fm(c + 1) = double(subs(f, x, xm));
        fe = fm(c + 1);
        E(c + 1) = Tol + 1;
        error = E(c + 1);

        fprintf('%-10s %-20s %-20s %-20s\n', 'i', 'xm', 'f(xm)', 'Error');
        fprintf('%s\n', repmat('-', 1, 72));
        fprintf('%-10d %-20.10f %-20.10f %-20s\n', c, xm, fe, '---');

        while error > Tol && fe ~= 0 && c < niter

            if fi * fe < 0
                xs = xm;
                fs = double(subs(f, x, xs));
            else
                xi = xm;
                fi = double(subs(f, x, xi));
            end

            xa = xm;
            xm = (xi + xs) / 2;
            fm(c + 2) = double(subs(f, x, xm));
            fe = fm(c + 2);
            % Error Absoluto
            % E(c + 2) = abs(xm - xa);
            % Error relativo (cambio)
            E(c+2) = abs(xm - xa) / abs(xm);
            error = E(c + 2);
            c = c + 1;

            fprintf('%-10d %-20.10f %-20.10f %-20.10e\n', c, xm, fe, error);
        end

        fprintf('%s\n', repmat('-', 1, 72));

        if fe == 0
            s = xm;
            fprintf('%f es raiz de f(x)\n', xm)
        elseif error < Tol
            s = xm;
            fprintf('%f es una aproximación de una raiz de f(x) con una tolerancia= %f\n', xm, Tol)
        else
            s = xm;
            fprintf('Fracasó en %d iteraciones\n', niter)
        end

    else
        fprintf('El intervalo es inadecuado\n')
        s = NaN; E = NaN; fm = NaN;
    end

end
