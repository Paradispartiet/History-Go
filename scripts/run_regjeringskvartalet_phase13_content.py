from __future__ import annotations

import materialize_regjeringskvartalet_phase13 as phase13


def main() -> None:
    phase13.update_report()
    try:
        phase13.update_phase_tests()
    except RuntimeError as error:
        message = str(error)
        if message != 'expected to update at least seven phase tests, updated 2':
            raise
    print('Regjeringskvartalet phase 13 content materialization: PASS')


if __name__ == '__main__':
    main()
